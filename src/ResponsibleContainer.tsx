import { DataTypes, IdDefaultType } from "@etsoo/shared";
import { Box, Stack, SxProps, Theme } from "@mui/material";
import React from "react";
import { ListChildComponentProps } from "react-window";
import {
  GridColumn,
  GridDataGet,
  GridJsonData,
  GridLoadDataProps,
  GridMethodRef,
  ReactUtils,
  useCombinedRefs,
  useDimensions
} from "@etsoo/react";
import {
  DataGridEx,
  DataGridExCalColumns,
  DataGridExProps
} from "./DataGridEx";
import { MUGlobal } from "./MUGlobal";
import { PullToRefreshUI } from "./PullToRefreshUI";
import {
  ScrollerListEx,
  ScrollerListExInnerItemRendererProps,
  ScrollerListExItemSize
} from "./ScrollerListEx";
import { SearchBar } from "./SearchBar";
import { Labels } from "./app/Labels";

/**
 * ResponsibleContainer props
 */
export type ResponsibleContainerProps<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
> = Omit<
  DataGridExProps<T, D>,
  "height" | "itemKey" | "loadData" | "mRef" | "onScroll" | "onItemsRendered"
> & {
  /**
   * Height will be deducted
   * @param height Current calcuated height
   * @param rect Current rect data
   */
  adjustHeight?: (height: number, rect: DOMRect) => number;

  /**
   * Columns
   */
  columns: GridColumn<T>[];

  /**
   * Container box SX (dataGrid determines the case)
   */
  containerBoxSx?: (
    paddings: Record<string, string | number>,
    hasFields: boolean,
    dataGrid?: boolean
  ) => SxProps<Theme>;

  /**
   * Min width to show Datagrid
   */
  dataGridMinWidth?: number;

  /**
   * Search fields
   */
  fields?: React.ReactElement[];

  /**
   * Search field template
   */
  fieldTemplate?: F;

  /**
   * Grid height
   */
  height?: number;

  /**
   * Inner item renderer
   */
  innerItemRenderer: (
    props: ScrollerListExInnerItemRendererProps<T>
  ) => React.ReactNode;

  /**
   * Item renderer
   */
  itemRenderer?: (props: ListChildComponentProps<T>) => React.ReactElement;

  /**
   * Item size, a function indicates its a variable size list
   */
  itemSize: ScrollerListExItemSize;

  /**
   * Load data callback
   */
  loadData: (
    data: GridJsonData & DataTypes.BasicTemplateType<F>
  ) => PromiseLike<T[] | null | undefined>;

  /**
   * Methods
   */
  mRef?: React.MutableRefObject<GridMethodRef<T> | undefined>;

  /**
   * Element ready callback
   */
  elementReady?: (element: HTMLElement, isDataGrid: boolean) => void;

  /**
   * Paddings
   */
  paddings?: Record<string, string | number>;

  /**
   * Pull to refresh data
   */
  pullToRefresh?: boolean;

  /**
   * Quick action for double click or click under mobile
   */
  quickAction?: (data: T) => void;

  /**
   * Size ready to read miliseconds span
   */
  sizeReadyMiliseconds?: number;

  /**
   * SearchBar height
   */
  searchBarHeight?: number;
};

interface LocalRefs<T> {
  rect?: DOMRect;
  ref?: GridMethodRef<T>;
  mounted?: boolean;
}

function defaultContainerBoxSx(
  paddings: object,
  hasField: boolean,
  _dataGrid?: boolean
): SxProps<Theme> {
  const half = MUGlobal.half(paddings);
  return {
    "& .SearchBox": {
      marginBottom: hasField ? half : 0
    }
  };
}

/**
 * Responsible container
 * @param props Props
 * @returns Layout
 */
export function ResponsibleContainer<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: ResponsibleContainerProps<T, F, D>) {
  // Destruct
  const {
    adjustHeight,
    columns,
    containerBoxSx = defaultContainerBoxSx,
    dataGridMinWidth = Math.max(576, DataGridExCalColumns(columns).total),
    elementReady,
    fields,
    fieldTemplate,
    height,
    loadData,
    mRef,
    paddings = MUGlobal.pagePaddings,
    pullToRefresh = true,
    quickAction,
    sizeReadyMiliseconds = 0,
    searchBarHeight = 45.6,
    ...rest
  } = props;

  // Labels
  const labels = Labels.CommonPage;

  // Refs
  const refs = React.useRef<LocalRefs<T>>({});
  const state = refs.current;

  const mRefs = useCombinedRefs(mRef, (ref: GridMethodRef<T>) => {
    if (ref == null) return;
    state.ref = ref;
  });

  // Update mounted state
  React.useEffect(() => {
    return () => {
      state.mounted = false;
    };
  }, []);

  // Has fields
  const hasFields = fields != null && fields.length > 0;

  // Load data
  const localLoadData = (props: GridLoadDataProps) => {
    state.mounted = true;
    const data = GridDataGet(props, fieldTemplate);
    return loadData(data);
  };

  // On submit callback
  const onSubmit = (data: FormData, _reset: boolean) => {
    if (data == null || state.ref == null) return;
    state.ref.reset({ data });
  };

  // Watch container
  const { dimensions } = useDimensions(
    1,
    undefined,
    sizeReadyMiliseconds,
    (_preRect, rect) => {
      // Check
      if (rect == null) return true;

      // Last rect
      const lastRect = state.rect;

      // 32 = scroll bar width
      if (
        lastRect != null &&
        state.mounted !== true &&
        Math.abs(rect.width - lastRect.width) <= 32 &&
        Math.abs(rect.height - lastRect.height) <= 32
      )
        return true;

      // Hold the new rect
      state.rect = rect;

      return false;
    }
  );

  // Rect
  const rect = dimensions[0][2];

  // Create list
  const [list, showDataGrid] = (() => {
    // No layout
    if (rect == null) return [null, undefined];

    // Width
    const width = rect.width;

    // Show DataGrid or List dependng on width
    const showDataGrid = width >= dataGridMinWidth;

    // Height
    let heightLocal: number;
    if (height != null) {
      heightLocal = height;
    } else {
      // Auto calculation
      heightLocal =
        document.documentElement.clientHeight - Math.round(rect.bottom + 1);

      const style = window.getComputedStyle(dimensions[0][1]!);
      const boxMargin = parseFloat(style.marginBottom);
      if (!isNaN(boxMargin)) heightLocal -= 3 * boxMargin; // 1 - Box, 2 - Page bottom

      if (adjustHeight != null) heightLocal -= adjustHeight(heightLocal, rect);
    }

    if (showDataGrid) {
      // Delete
      delete rest.itemRenderer;

      return [
        <Box className="DataGridBox">
          <DataGridEx<T, D>
            autoLoad={!hasFields}
            height={heightLocal}
            width={rect.width}
            loadData={localLoadData}
            mRef={mRefs}
            onDoubleClick={(_, data) => quickAction && quickAction(data)}
            outerRef={(element?: HTMLDivElement) => {
              if (element != null && elementReady) elementReady(element, true);
            }}
            columns={columns}
            {...rest}
          />
        </Box>,
        true
      ];
    }

    // Delete
    delete rest.checkable;
    delete rest.borderRowsCount;
    delete rest.bottomHeight;
    delete rest.footerItemRenderer;
    delete rest.headerHeight;
    delete rest.hideFooter;
    delete rest.hoverColor;
    delete rest.selectable;

    return [
      <Box className="ListBox" sx={{ height: heightLocal }}>
        <ScrollerListEx<T, D>
          autoLoad={!hasFields}
          height={heightLocal}
          loadData={localLoadData}
          mRef={mRefs}
          onClick={(event, data) =>
            quickAction && ReactUtils.isSafeClick(event) && quickAction(data)
          }
          oRef={(element) => {
            if (element != null && elementReady) elementReady(element, false);
          }}
          {...rest}
        />
      </Box>,
      false
    ];
  })();

  const searchBar = React.useMemo(() => {
    if (!hasFields || showDataGrid == null) return;
    return (
      <SearchBar
        fields={fields}
        onSubmit={onSubmit}
        className={`searchBar${showDataGrid ? "Grid" : "List"}`}
      />
    );
  }, [showDataGrid, hasFields, searchBarHeight]);

  // Pull container
  const pullContainer =
    showDataGrid == null
      ? undefined
      : showDataGrid
      ? ".DataGridEx-Body"
      : ".ScrollerListEx-Body";

  // Layout
  return (
    <Box
      sx={
        containerBoxSx == null
          ? undefined
          : containerBoxSx(paddings, hasFields, showDataGrid)
      }
    >
      <Stack>
        <Box
          ref={dimensions[0][0]}
          className="SearchBox"
          sx={{ height: hasFields ? searchBarHeight : 0 }}
        >
          {searchBar}
        </Box>
        {list}
      </Stack>
      {pullToRefresh && pullContainer && (
        <PullToRefreshUI
          mainElement={pullContainer}
          triggerElement={pullContainer}
          instructionsPullToRefresh={labels.pullToRefresh}
          instructionsReleaseToRefresh={labels.releaseToRefresh}
          instructionsRefreshing={labels.refreshing}
          onRefresh={() => state.ref?.reset()}
          shouldPullToRefresh={() => {
            const container = document.querySelector(pullContainer);
            return !container?.scrollTop;
          }}
        />
      )}
    </Box>
  );
}
