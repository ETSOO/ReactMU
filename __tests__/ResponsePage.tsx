import { act, render } from "@testing-library/react";
import {
  MUGlobal,
  MobileListItemRenderer,
  ReactAppContext,
  ResponsivePage,
  SearchField
} from "../src";
import React from "react";

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

type Data = {
  id: number;
  name: string;
  deviceName?: string;
  data?: string;
  creation?: Date;
};

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
vi.useFakeTimers();

// TypeScript const assertions
const fieldTemplate = {
  id: "number",
  name: "string"
} as const;

it("Render ResponsePage", async () => {
  act(() => {
    // Act
    render(
      <ReactAppContext.Provider value={null}>
        <ResponsivePage<Data, typeof fieldTemplate>
          fields={[<SearchField label="Keyword" name="keyword" minChars={2} />]}
          height={200}
          itemSize={[118, MUGlobal.pagePaddings]}
          fieldTemplate={fieldTemplate}
          loadData={({ id }) =>
            Promise.resolve([
              { id: 1, name: "Name 1" },
              { id: 2, name: "Name 2" },
              { id: id ?? 0, name: "auto" }
            ])
          }
          columns={[
            { field: "id", header: "ID" },
            { field: "name", header: "Name" },
            {
              field: "deviceName",
              header: "Value",
              valueFormatter: ({ data }) => data?.deviceName ?? data?.name
            }
          ]}
          innerItemRenderer={(props) =>
            MobileListItemRenderer(props, (data) => {
              return [
                data.name,
                undefined,
                [],
                <React.Fragment></React.Fragment>
              ];
            })
          }
        />
      </ReactAppContext.Provider>
    );

    // Fast forward
    vi.runOnlyPendingTimers();
  });

  // Assert
  expect(document.getElementById("page-container")).not.toBeNull();
});
