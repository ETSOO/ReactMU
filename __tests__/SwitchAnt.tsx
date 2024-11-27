import { screen, render } from "@testing-library/react";
import React, { act } from "react";
import { SwitchAnt } from "../src/SwitchAnt";

it("SwitchAnt Tests", () => {
  const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) =>
    expect(event.target.checked).toBeTruthy()
  );

  // Render component
  act(() => {
    render(<SwitchAnt startLabel="No" endLabel="Yes" onChange={onChange} />);
  });

  const yes = screen.getByText("Yes");

  act(() => {
    yes.click();
  });

  expect(onChange).toHaveBeenCalled();
});
