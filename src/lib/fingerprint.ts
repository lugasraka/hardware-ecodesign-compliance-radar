export type FingerprintKind = "html" | "json";

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          sortValue((value as Record<string, unknown>)[key]),
        ]),
    );
  }
  return value;
}

/**
 * Reduce a source response to the content that matters for a change check.
 * HTML nonces, scripts, styles, and markup are ignored. JSON keys are sorted.
 */
export function stableFingerprint(
  body: string,
  kind: FingerprintKind,
): string {
  if (kind === "json") {
    try {
      return JSON.stringify(sortValue(JSON.parse(body)));
    } catch {
      return body.trim();
    }
  }

  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Return the normalized content, or fail loudly when the response has no
 * readable text. An empty fingerprint must never be treated as a source
 * change: bot challenges and blocked requests can return a 2xx with no body.
 */
export function getReadableFingerprint(
  body: string,
  kind: FingerprintKind,
): string {
  const fingerprint = stableFingerprint(body, kind);
  if (!fingerprint) {
    throw new Error("Source returned no readable content");
  }
  return fingerprint;
}
