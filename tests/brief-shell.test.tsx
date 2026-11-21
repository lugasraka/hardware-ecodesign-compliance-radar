import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { BriefShell } from "@/components/brief-shell";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("BriefShell", () => {
  it("defaults to summary and switches to the full brief", () => {
    render(
      <BriefShell
        productId="phone-orbit-2028"
        productShortName="Orbit 2028"
        markdown="# Brief"
        summary={<div>Summary view</div>}
        full={<div>Full view</div>}
      />,
    );

    expect(screen.getByText("Summary view")).toBeInTheDocument();
    expect(screen.queryByText("Full view")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Full brief" }));

    expect(screen.getByText("Full view")).toBeInTheDocument();
    expect(screen.queryByText("Summary view")).not.toBeInTheDocument();
    expect(window.location.hash).toBe("#full");
  });
});
