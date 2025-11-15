import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { InputTipField } from "../src";

it("Render default InputTipField", async () => {
  // Render component
  act(() => {
    render(
      <InputTipField
        name="amount"
        type="number"
        componentProps={{
          loadData: (_value) => Promise.resolve([])
        }}
        slotProps={{ htmlInput: { role: "input" } }}
      />
    );
  });

  const input = screen.getByRole<HTMLInputElement>("input");
  expect(input.type).toBe("number");
});

it("Render email InputTipField", async () => {
  // Arrange
  type T = { id: number; name: string };
  const options: T[] = [
    { id: 1, name: "Name 1" },
    { id: 2, name: "Name 2" }
  ];

  const changeHandler = vi.fn();

  const flag = "2 items";

  // Render component
  act(() => {
    render(
      <InputTipField<T>
        component="email"
        componentProps={{
          loadData: (_value) => Promise.resolve([options, flag]),
          itemLabel: (item) => item.name + ` (${item.id})`
        }}
        onChangeDelay={changeHandler}
        slotProps={{ htmlInput: { role: "input" } }}
      />
    );
  });

  const input = screen.getByRole<HTMLInputElement>("input");
  expect(input.type).toBe("email");

  act(() => {
    vi.useFakeTimers();

    fireEvent.change(input, { target: { value: "info@etsoo.com" } });
    expect(input.value).toBe("info@etsoo.com");

    vi.runAllTimers();
    expect(changeHandler).toHaveBeenCalled();

    // Restore timers, otherwise 'waitFor' will fail
    vi.useRealTimers();
  });

  await waitFor(() => {
    const button = screen.getByText(flag);
    expect(button.nodeName).toBe("P");

    fireEvent.click(button);

    const item = screen.getByText("Name 2 (2)");
    expect(item.nodeName).toBe("LI");
  });
});
