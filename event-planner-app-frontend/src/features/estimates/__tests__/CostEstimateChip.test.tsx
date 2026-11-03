import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CostEstimateChip from "../components/CostEstimateChip";
import { costEstimateLabels } from "../utils";

describe("CostEstimateChip", () => {
  it("shows the per-person cost and the price tier of an estimate", () => {
    render(<CostEstimateChip estimate={costEstimateLabels(24.5, 3)} />);

    expect(screen.getByText("~£24.50 pp")).toBeInTheDocument();
    expect(screen.getByLabelText("Price tier 3 of 4")).toHaveTextContent("£££");
  });

  it("renders nothing for items without a usable estimate", () => {
    const { container } = render(
      <CostEstimateChip estimate={costEstimateLabels(null, 9)} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
