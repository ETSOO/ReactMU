import React from "react";
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

  await vi.waitFor(
    async () => {
      await screen.findByRole("button");
    },
    {
      timeout: 500, // default is 1000
      interval: 20 // default is 50
    }
  );

  // Act, click the list
  const clicked = fireEvent.click(screen.getByRole("button"));
  expect(clicked).toBeTruthy();

  // Get list item
  const item = screen.getByText("Name 1");
  expect(item.nodeName).toBe("LI");
});
