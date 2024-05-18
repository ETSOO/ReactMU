import { act, render } from "@testing-library/react";
import { MUGlobal, MobileListItemRenderer, ResponsivePage } from "../src";
import React from "react";

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

type Data = { id: number; name: string };

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

// TypeScript const assertions
const fieldTemplate = {
  id: "number",
  name: "string"
} as const;

it("Render ResponsePage", async () => {
  // Act
  render(
    <ResponsivePage<Data, typeof fieldTemplate>
      fields={[]}
      columns={[
        { field: "id", header: "ID" },
        { field: "name", header: "Name" }
      ]}
      itemSize={[118, MUGlobal.pagePaddings]}
      fieldTemplate={fieldTemplate}
      loadData={({ id }) =>
        Promise.resolve([
          { id: 1, name: "Name 1" },
          { id: 2, name: "Name 2" },
          { id: id ?? 0, name: "auto" }
        ])
      }
      innerItemRenderer={(props) =>
        MobileListItemRenderer(props, (data) => {
          return [data.name, undefined, [], <React.Fragment></React.Fragment>];
        })
      }
    />
  );

  act(() => {
    // Fast forward
    jest.runOnlyPendingTimers();
  });

  // Assert
  expect(document.getElementById("page-container")).not.toBeNull();
});
