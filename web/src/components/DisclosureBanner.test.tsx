import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DisclosureBanner } from "../components/DisclosureBanner";

describe("DisclosureBanner", () => {
  it("renders the disclosure text", () => {
    render(
      <DisclosureBanner text="Investigative lead only. Not proof of identity. Confidence bands summarise the strongest supporting evidence tier; they are not probabilities." />,
    );
    expect(screen.getByRole("note")).toHaveTextContent("Investigative lead only");
  });
});
