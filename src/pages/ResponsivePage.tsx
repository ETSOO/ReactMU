import React from "react";
import { MUGlobal } from "../MUGlobal";
import { ResponsibleContainer } from "../ResponsibleContainer";
import { CommonPage } from "./CommonPage";
import { OperationMessageContainer } from "../messages/OperationMessageContainer";
import type { DataGridPageProps } from "./DataGridPageProps";
import type {
  ScrollerListExItemSize,
  ScrollerListExProps
} from "../ScrollerListEx";
import { GridMethodRef } from "@etsoo/react";
import type { OperationMessageHandlerAll } from "../messages/OperationMessageHandler";

/**
 * Response page props
 */
export type ResponsePageProps<T extends object, F> = DataGridPageProps<T, F> & {
  /**
   *
   * @param height Current height
   * @param isGrid Is displaying DataGrid
   * @returns Adjusted height
   */
  adjustFabHeight?: (height: number, isGrid: boolean) => number;

  /**
   * Min width to show Datagrid
   */
  dataGridMinWidth?: number;

  /**
   * Item renderer
   */
  itemRenderer?: ScrollerListExProps<T>["itemRenderer"];

  /**
   * Item size, a function indicates its a variable size list
   */
  itemSize: ScrollerListExItemSize;

  /**
   * Methods
   */
  mRef?: React.MutableRefObject<GridMethodRef<T> | undefined>;

  /**
   * Pull to refresh data
   */
  pullToRefresh?: boolean;

  /**
   * Quick action for double click or click under mobile
   */
  quickAction?: (data: T) => void;

  /**
   * Operation message handler
   */
  operationMessageHandler?: OperationMessageHandlerAll;
};

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function ResponsivePage<T extends object, F>(
  props: ResponsePageProps<T, F>
) {
  // Destruct
  const { pageProps = {}, operationMessageHandler, ...rest } = props;

  pageProps.paddings ??= MUGlobal.pagePaddings;
  const { paddings, fabColumnDirection, ...pageRest } = pageProps;

  // State
  const [scrollContainer, setScrollContainer] = React.useState<HTMLElement>();
  const [direction, setDirection] = React.useState(fabColumnDirection);

  // Layout
  return (
    <CommonPage
      {...pageRest}
      paddings={{}}
      scrollContainer={scrollContainer}
      fabColumnDirection={direction}
    >
      {operationMessageHandler && (
        <OperationMessageContainer handler={operationMessageHandler} />
      )}
      <ResponsibleContainer<T, F>
        paddings={paddings}
        containerBoxSx={(paddings, hasField, _dataGrid) => {
          // Half
          const half =
            typeof paddings == "number"
              ? paddings / 2
              : MUGlobal.half(paddings);

          // .SearchBox keep the same to avoid flick when switching between DataGrid and List
          return {
            paddingTop: paddings,
            "& .SearchBox": {
              marginLeft: paddings,
              marginRight: paddings,
              marginBottom: hasField ? half : 0
            },
            "& .ListBox": {
              marginBottom: paddings
            },
            "& .DataGridBox": {
              marginLeft: paddings,
              marginRight: paddings,
              marginBottom: paddings
            }
          };
        }}
        elementReady={(element, isDataGrid) => {
          setDirection(!isDataGrid);
          setScrollContainer(element);
        }}
        {...rest}
      />
    </CommonPage>
  );
}
