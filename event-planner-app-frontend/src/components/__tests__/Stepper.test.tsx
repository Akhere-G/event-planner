import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Stepper from "../Stepper";

const steps = ["One", "Two", "Three"];

describe("Stepper", () => {
  it("marks only the current step", () => {
    render(<Stepper steps={steps} currentStep={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });

  it("only lets the user go back to completed steps", async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} currentStep={1} onStepClick={onStepClick} />);

    await user.click(screen.getByRole("button", { name: /Step 1: One/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);

    expect(
      screen.getByRole("button", { name: "Step 3: Three" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Step 2: Two" })).toBeDisabled();
  });
});
