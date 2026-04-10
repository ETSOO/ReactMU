import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { SwitchAnt } from "../src/SwitchAnt";
import { NumberFieldInput } from "@base-ui/react/number-field";

it("SwitchAnt Tests", () => {
  const onChange = vi.fn();

  // Render component
  act(() => {
    render(<SwitchAnt startLabel="No" endLabel="Yes" onChange={onChange} />);
  });

  const control = screen.getByRole("switch");

  act(() => {
    fireEvent.click(control);
  });

  expect(onChange).toHaveBeenCalled();
});
