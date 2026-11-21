import { describe, expect, it } from "vitest";
import { stableFingerprint } from "@/lib/fingerprint";

describe("source fingerprint", () => {
  it("ignores markup, scripts, styles, and rotating attributes", () => {
    const before =
      '<html><head><style>.a{color:red}</style><script nonce="abc">x()</script></head><body><p>Battery rules</p></body></html>';
    const after =
      '<html><head><style>.a{color:blue}</style><script nonce="xyz">y()</script></head><body><p>Battery rules</p></body></html>';

    expect(stableFingerprint(before, "html")).toBe("Battery rules");
    expect(stableFingerprint(after, "html")).toBe("Battery rules");
  });

  it("detects a real text change", () => {
    const before = "<p>Batteries must be removable.</p>";
    const after = "<p>Batteries must be replaceable.</p>";

    expect(stableFingerprint(before, "html")).not.toBe(
      stableFingerprint(after, "html"),
    );
  });

  it("ignores JSON key order but not value changes", () => {
    const before = JSON.stringify({ count: 2, results: [{ title: "A" }] });
    const reordered = JSON.stringify({ results: [{ title: "A" }], count: 2 });
    const changed = JSON.stringify({ count: 3, results: [{ title: "A" }] });

    expect(stableFingerprint(before, "json")).toBe(
      stableFingerprint(reordered, "json"),
    );
    expect(stableFingerprint(before, "json")).not.toBe(
      stableFingerprint(changed, "json"),
    );
  });

  it("falls back to trimmed text for invalid JSON", () => {
    expect(stableFingerprint("  not json  ", "json")).toBe("not json");
  });
});
