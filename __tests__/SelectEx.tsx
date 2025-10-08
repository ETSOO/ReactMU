import { act } from "react";
import { SelectEx } from "../src";
import { fireEvent, render, screen } from "@testing-library/react";
import { ListType1, Utils } from "@etsoo/shared";

it("Render SelectEx", async () => {
  // Arrange
  type T = { id: number; name: string };
  const options: T[] = [
    { id: 1, name: "Name 1" },
    { id: 2, name: "Name 2" }
  ];

  Utils.addBlankItem(options, "id", "name");

  const itemChangeCallback = vi.fn((option, userAction) => {
    if (userAction) expect(option).toBeUndefined();
    else expect(option.id).toBe(1);
  });

  // Render component
  act(() => {
    render(
      <SelectEx<T>
        options={options}
        name="test"
        onItemChange={itemChangeCallback}
        value={1}
        search
        labelField="name"
      />
    );
  });

  expect(itemChangeCallback).toHaveBeenCalled();

  // Act, click to show the list
  const button = screen.getByRole("combobox");

  // https://davidwcai.medium.com/react-testing-library-and-the-not-wrapped-in-act-errors-491a5629193b
  act(() => {
    vi.useFakeTimers();

    fireEvent.mouseDown(button); // Not click

    vi.advanceTimersByTime(100).useRealTimers();
  });

  // Get list item
  const itemName2 = await screen.findByText("Name 2");
  expect(itemName2.nodeName).toBe("SPAN");

  const itemBlank = await screen.findByText("---");
  expect(itemBlank.nodeName).toBe("SPAN");

  act(() => {
    itemBlank.click();
  });

  expect(itemChangeCallback).toBeCalledTimes(2);
});

it("Render multiple SelectEx", async () => {
  // Arrange
  type T = ListType1;
  const options: T[] = [
    { id: "1", label: "Name 1" },
    { id: "2", label: "Name 2" },
    { id: "3", label: "Name 3" }
  ];

  const itemChangeCallback = vi.fn((option, userAction) => {
    if (userAction) expect(option.id).toBe("3");
    else expect(option.id).toBe("1");
  });

  // Render component
  const { baseElement } = render(
    <SelectEx<T>
      options={options}
      name="test"
      onItemChange={itemChangeCallback}
      value={["1", "2"]}
      multiple
    />
  );

  expect(itemChangeCallback).toBeCalled();

  // Act, click to show the list
  const button = screen.getByRole("combobox");
  fireEvent.mouseDown(button); // Not click

  // Get list item
  const itemName1 = await screen.findByText("Name 1");
  const checkbox1 = itemName1.closest("li")?.querySelector("input");

  expect(checkbox1?.checked).toBeTruthy();

  const itemName3 = await screen.findByText("Name 3");
  expect(itemName3.nodeName).toBe("SPAN");

  // Checkbox
  const checkbox3 = itemName3.closest("li")?.querySelector("input");

  act(() => {
    checkbox3?.click();
  });

  expect(checkbox3?.checked).toBeTruthy();

  expect(itemChangeCallback).toHaveBeenCalledTimes(2);
});
