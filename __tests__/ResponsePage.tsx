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

it("Render ResponsePage", async () => {
  // Act
  render(
    <ResponsivePage<Data>
      fields={[]}
      columns={[
        { field: "id", header: "ID" },
        { field: "name", header: "Name" }
      ]}
      itemSize={[118, MUGlobal.pagePaddings]}
      loadData={(_data) =>
        Promise.resolve([
          { id: 1, name: "Name 1" },
          { id: 2, name: "Name 2" }
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
