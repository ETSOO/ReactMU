import { act, render, renderHook } from "@testing-library/react";
import {
  MobileListItemRenderer,
  ReactAppContext,
  ResponsivePage,
  SearchField
} from "../src";
import React from "react";
import { GridMethodRef } from "@etsoo/react";

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

it("Render ResponsivePage", async () => {
  act(() => {
    // Hook
    const { result: ref } = renderHook(() =>
      React.useRef<GridMethodRef<Data>>(undefined)
    );

    // Act
    render(
      <ReactAppContext.Provider value={null}>
        <ResponsivePage<Data, typeof fieldTemplate>
          fields={[<SearchField label="Keyword" name="keyword" minChars={2} />]}
          height={200}
          rowHeight={[53, 116]}
          mRef={ref.current}
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
          itemRenderer={(props) =>
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
