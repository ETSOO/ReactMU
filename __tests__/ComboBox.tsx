import { ComboBox } from "../src";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";

it("Render ComboBox", async () => {
  // Arrange
  type T = { id: number; name: string };
  const options: T[] = [
    { id: 1, name: "Name 1" },
    { id: 2, name: "Name 2" }
  ];

  act(() => {
    render(
      <ComboBox<T>
        name="Test"
        options={options}
        labelField="name"
        label="Test"
      />
    );
  });

  await waitFor(async () => {
    const button = await screen.findByRole("button");

    // Act, click the list
    const clicked = fireEvent.click(button);
    expect(clicked).toBeTruthy();

    // Get list item
    const item = await screen.findByText("Name 1");
    expect(item.nodeName).toBe("LI");
  });
});
