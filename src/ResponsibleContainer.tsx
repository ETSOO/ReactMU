import React from "react";
import {
  GridColumn,
  GridJsonData,
  GridLoadDataProps,
  GridMethodRef,
  GridTemplateType,
  ReactUtils,
  useCombinedRefs,
  useDimensions,
  useSearchParamsWithCache
} from "@etsoo/react";
import { DataGridEx, DataGridExProps } from "./DataGridEx";
import { MUGlobal } from "./MUGlobal";
import { PullToRefreshUI } from "./PullToRefreshUI";
import { ScrollerListEx, ScrollerListExProps } from "./ScrollerListEx";
import { SearchBar } from "./SearchBar";
import { Labels } from "./app/Labels";
import { GridUtils } from "./GridUtils";
import { SxProps, Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

/**
 * ResponsibleContainer props
 */
export type ResponsibleContainerProps<T extends object, F> = Omit<
  DataGridExProps<T>,
  "height" | "loadData" | "mRef" | "onInitLoad" | "onUpdateRows" | "rowHeight"
> & {
  /**
   * Height will be deducted
   * @param height Current calcuated height
   * @param rect Current rect data
   */
  adjustHeight?: number | ((height: number, rect: DOMRect) => number);

  /**
   *
   * @param height Current height
   * @param isGrid Is displaying DataGrid
   * @returns Adjusted height
   */
  adjustFabHeight?: (height: number, isGrid: boolean) => number;

  /**
   * Columns
   */
  columns: GridColumn<T>[];

  /**
   * Container box SX (dataGrid determines the case)
   */
  containerBoxSx?: (
    paddings: number | Record<string, string | number>,
    hasFields: boolean,
    dataGrid?: boolean
  ) => SxProps<Theme>;

  /**
   * Search fields
   */
  fields?:
    | React.ReactElement[]
    | ((data: GridTemplateType<F>) => React.ReactElement[]);

  /**
   * Search field template
   */
  readonly fieldTemplate: F;

  /**
   * Grid height
   */
  height?: number;

  /**
   * Item renderer
   */
  itemRenderer?: ScrollerListExProps<T>["itemRenderer"];

  /**
   * Load data callback
   */
  loadData: (
    data: GridJsonData & GridTemplateType<F>,
    lastItem?: T
  ) => PromiseLike<T[] | null | undefined>;

  /**
   * Methods
   */
  mRef?: React.RefObject<GridMethodRef<T> | undefined>;

  /**
   * Element ready callback
   */
  elementReady?: (element: HTMLElement, isDataGrid: boolean) => void;

  /**
   * Paddings
   */
  paddings?: number | Record<string, string | number>;

  /**
   * Pull to refresh data
   */
  pullToRefresh?: boolean;

  /**
   * Quick action for double click or click under mobile
   */
  quickAction?: (data: T) => void;

  /**
   * Row height
   * @param isGrid Is displaying as DataGrid
   */
  rowHeight?:
    | number
    | [number, number]
    | (<B extends boolean>(
        isGrid: B
      ) => B extends true
        ? DataGridExProps<T>["rowHeight"]
        : ScrollerListExProps<T>["rowHeight"]);

  /**
   * Size ready to read miliseconds span
   */
  sizeReadyMiliseconds?: number;

  /**
   * SearchBar height
   */
  searchBarHeight?: number;

  /**
   * SearchBar bottom padding
   */
  searchBarBottom?: number;

  /**
   * SearchBar top
   */
  searchBarTop?: number | true;
};

interface LocalRefs<T> {
  rect?: DOMRect;
  ref?: GridMethodRef<T>;
  mounted?: boolean;
  initLoaded?: boolean;
}

function defaultContainerBoxSx(
  paddings: object | number,
  hasField: boolean,
  _dataGrid?: boolean
): SxProps<Theme> {
  const half =
    typeof paddings == "number" ? paddings / 2 : MUGlobal.half(paddings);
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
export function ResponsibleContainer<T extends object, F>(
  props: ResponsibleContainerProps<T, F>
) {
  // Destruct
  const {
    adjustHeight,
    adjustFabHeight,
    cacheKey,
    cacheMinutes = 15,
    columns,
    containerBoxSx = defaultContainerBoxSx,
    elementReady,
    fields,
    fieldTemplate,
    height,
    loadData,
    mRef,
    paddings = MUGlobal.pagePaddings,
    pullToRefresh = true,
    quickAction,
    rowHeight,
    sizeReadyMiliseconds = 0,
    searchBarHeight = 45.6,
    searchBarBottom = 8,
    searchBarTop,
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

    if (ref.element && elementReady) elementReady(ref.element, true);
  });

  // Screen size detection
  const showDataGrid = useMediaQuery("(min-width:600px)");

  // Update mounted state
  React.useEffect(() => {
    return () => {
      state.mounted = false;
    };
  }, []);

  // Has fields
  const hasFields = fields != null && fields.length > 0;

  // Load data
  const localLoadData = (props: GridLoadDataProps, lastItem?: T) => {
    state.mounted = true;
    return loadData(
      GridUtils.createLoader(props, fieldTemplate, cacheKey, false),
      lastItem
    );
  };

  const getRowHeight = React.useCallback(
    <B extends boolean>(isGrid: B) => {
      if (rowHeight == null) return undefined;
      else if (typeof rowHeight === "number")
        return isGrid ? undefined : rowHeight;
      else if (Array.isArray(rowHeight)) return rowHeight[isGrid ? 0 : 1];
      else return rowHeight<B>(isGrid);
    },
    [rowHeight]
  );

  // Search data
  const searchData = useSearchParamsWithCache(cacheKey);

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
  const list = (() => {
    // No layout
    if (rect == null) return undefined;

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
      if (!isNaN(boxMargin)) heightLocal -= boxMargin;

      if (adjustHeight != null)
        heightLocal -=
          typeof adjustHeight === "number"
            ? adjustHeight
            : adjustHeight(heightLocal, rect);
    }

    if (adjustFabHeight)
      heightLocal = adjustFabHeight(heightLocal, showDataGrid);

    if (showDataGrid) {
      // Remove useless props
      const { itemRenderer, ...gridProps } = rest;

      return (
        <Box className="DataGridBox">
          <DataGridEx<T>
            autoLoad={!hasFields}
            height={heightLocal}
            width={rect.width}
            loadData={localLoadData}
            mRef={mRefs}
            onDoubleClick={(_, data) => quickAction && quickAction(data)}
            columns={columns}
            rowHeight={getRowHeight(true)}
            {...gridProps}
          />
        </Box>
      );
    }

    // Remove useless props
    const {
      checkable,
      borderRowsCount,
      bottomHeight,
      footerItemRenderer,
      headerHeight,
      hideFooter,
      hoverColor,
      selectable,
      onCellsRendered,
      ...listProps
    } = rest;

    return (
      <Box className="ListBox" sx={{ height: heightLocal }}>
        <ScrollerListEx<T>
          autoLoad={!hasFields}
          height={heightLocal}
          loadData={localLoadData}
          mRef={mRefs}
          onClick={(event, data) =>
            quickAction && ReactUtils.isSafeClick(event) && quickAction(data)
          }
          rowHeight={getRowHeight(false)}
          {...listProps}
        />
      </Box>
    );
  })();

  const searchBar = React.useMemo(() => {
    if (
      !hasFields ||
      showDataGrid == null ||
      rect?.width == null ||
      rect.width < 20
    )
      return;

    const f = typeof fields == "function" ? fields(searchData) : fields;

    return (
      <SearchBar
        fields={f}
        onSubmit={onSubmit}
        className={`searchBar${showDataGrid ? "Grid" : "List"}`}
        width={rect.width}
        top={searchBarTop}
      />
    );
  }, [showDataGrid, hasFields, searchBarHeight, rect?.width]);

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
          sx={{
            height: hasFields ? searchBarHeight : 0
          }}
          marginBottom={
            hasFields ? `${searchBarBottom}px!important` : undefined
          }
        >
          {searchBar}
        </Box>
        {list}
      </Stack>
      {pullToRefresh && pullContainer && list != null && (
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
