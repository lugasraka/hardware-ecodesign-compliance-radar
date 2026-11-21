import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { regulatorySources, type RegulatorySource } from "../src/data/regulatory-sources";
import { stableFingerprint } from "../src/lib/fingerprint";

const STATE_VERSION = 2;

interface SourceState {
  hash: string;
  lastChecked: string;
  lastChanged: string | null;
  status: "ok" | "error";
  message?: string;
}

interface SourceStateFile {
  version: number;
  checkedAt: string | null;
  sources: Record<string, SourceState>;
}

interface WatchCandidate {
  sourceId: string;
  label: string;
  url: string;
  instrumentId?: string;
  detectedAt: string;
  changeType: "source_changed";
  status: "new";
  summary: string;
}

const STATE_PATH = "data/source-state.json";
const WATCH_PATH = "data/regulatory-watch.generated.json";
const TIMEOUT_MS = 20000;
const CONFIRM_DELAY_MS = 1500;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFingerprint(source: RegulatorySource): Promise<string> {
  const body = await fetchText(source.url);
  return hash(stableFingerprint(body, source.kind));
}

async function confirmFingerprint(
  source: RegulatorySource,
  firstHash: string,
  previousHash: string | undefined,
): Promise<{ hash: string; changed: boolean }> {
  if (!previousHash || firstHash === previousHash) {
    return { hash: firstHash, changed: false };
  }

  // EUR-Lex occasionally serves a transient variant. Confirm a change with a
  // second request before it enters the review queue.
  await delay(CONFIRM_DELAY_MS);
  const secondHash = await fetchFingerprint(source);

  if (secondHash === previousHash) {
    return { hash: secondHash, changed: false };
  }

  return { hash: secondHash, changed: true };
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "hardware-ecodesign-compliance-radar/0.1 regulatory-watch (portfolio prototype)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function stateSignature(sources: Record<string, SourceState>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(sources).map(([id, item]) => [
        id,
        {
          hash: item.hash,
          lastChanged: item.lastChanged,
          status: item.status,
          message: item.message ?? null,
        },
      ]),
    ),
  );
}

async function main() {
  await mkdir("data", { recursive: true });

  let state: SourceStateFile = {
    version: STATE_VERSION,
    checkedAt: null,
    sources: {},
  };
  try {
    const parsed = JSON.parse(
      await readFile(STATE_PATH, "utf8"),
    ) as SourceStateFile;
    if (parsed.version === STATE_VERSION) {
      state = parsed;
    } else {
      console.log("State version changed. Rebuilding the source baseline.");
    }
  } catch {
    // First run: the state file does not exist yet.
  }

  const checkedAt = new Date().toISOString();
  const candidates: WatchCandidate[] = [];
  const previousSources = { ...state.sources };
  const previousSignature = stateSignature(previousSources);
  const automatedSources = regulatorySources.filter(
    (source) => source.check === "http",
  );
  const monitoredIds = new Set(automatedSources.map((source) => source.id));

  for (const id of Object.keys(state.sources)) {
    if (!monitoredIds.has(id)) {
      delete state.sources[id];
    }
  }

  for (const source of regulatorySources) {
    if (source.check === "manual") {
      console.log(
        `MANUAL ${source.id}: ${source.note ?? "review the official source in a browser"}`,
      );
      continue;
    }

    const previous = state.sources[source.id];
    try {
      const firstHash = await fetchFingerprint(source);
      const { hash: nextHash, changed } = await confirmFingerprint(
        source,
        firstHash,
        previous?.hash,
      );
      const recovered = previous?.status === "error";

      state.sources[source.id] = {
        hash: nextHash,
        lastChecked: checkedAt,
        lastChanged:
          changed || recovered ? checkedAt : (previous?.lastChanged ?? checkedAt),
        status: "ok",
      };

      if (changed || recovered) {
        candidates.push({
          sourceId: source.id,
          label: source.label,
          url: source.url,
          instrumentId: source.instrumentId,
          detectedAt: checkedAt,
          changeType: "source_changed",
          status: "new",
          summary: recovered
            ? "The source is reachable again. Verify the content and confirm the clause."
            : "The source content changed. Open the official text and decide whether the clause library needs an update.",
        });
      }

      console.log(
        `${changed || recovered ? "CHANGED" : previous?.hash ? "unchanged" : "baseline"} ${source.id}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const errorChanged =
        previous?.status !== "error" || previous.message !== message;

      state.sources[source.id] = {
        hash: previous?.hash ?? "",
        lastChecked: checkedAt,
        lastChanged: previous?.lastChanged ?? null,
        status: "error",
        message,
      };

      if (errorChanged) {
        candidates.push({
          sourceId: source.id,
          label: source.label,
          url: source.url,
          instrumentId: source.instrumentId,
          detectedAt: checkedAt,
          changeType: "source_changed",
          status: "new",
          summary: `Source check failed (${message}). Verify the URL manually before treating this as a regulatory change.`,
        });
      }

      console.warn(`ERROR ${source.id}: ${message}`);
    }
  }

  const nextSignature = stateSignature(state.sources);
  const baseline = automatedSources.some(
    (source) =>
      !previousSources[source.id]?.hash &&
      state.sources[source.id]?.status === "ok",
  );
  const shouldWrite =
    candidates.length > 0 || baseline || nextSignature !== previousSignature;

  if (!shouldWrite) {
    console.log("No source changes. The data files are unchanged.");
    return;
  }

  await writeFile(
    STATE_PATH,
    `${JSON.stringify({ version: STATE_VERSION, checkedAt, sources: state.sources }, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    WATCH_PATH,
    `${JSON.stringify({ generatedAt: checkedAt, candidates }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Checked ${automatedSources.length} sources. ${candidates.length} candidate(s) written to ${WATCH_PATH}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
