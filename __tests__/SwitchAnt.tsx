import { getByText, render } from "@testing-library/react";
import React, { act } from "react";
import { SwitchAnt } from "../src/SwitchAnt";

it("SwitchAnt Tests", () => {
  const onChange = jest.fn((event: React.ChangeEvent<HTMLInputElement>) =>
    expect(event.target.checked).toBeTruthy()
  );

  // Render component
  const { baseElement } = render(
    <SwitchAnt startLabel="No" endLabel="Yes" onChange={onChange} />
  );

  const yes = getByText(baseElement, "Yes");

  act(() => {
    yes.click();
  });

  expect(onChange).toHaveBeenCalled();
});
