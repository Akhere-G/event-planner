import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Accordion from "../Accordion";

function Host() {
  const [renders, setRenders] = useState(0);

  // Inline closures, as callers write them: new function identities every render.
  return (
    <>
      <button onClick={() => setRenders((n) => n + 1)}>
        Rerender {renders}
      </button>
      <Accordion
        open
        TitleComponent={() => <span>Title</span>}
        ContentComponent={() => <input aria-label="Draft" />}
      />
    </>
  );
}

describe("Accordion", () => {
  it("keeps what was typed in its content when the parent re-renders", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.type(screen.getByLabelText("Draft"), "half written");
    await user.click(screen.getByRole("button", { name: /Rerender/ }));

    expect(screen.getByLabelText("Draft")).toHaveValue("half written");
  });
});
