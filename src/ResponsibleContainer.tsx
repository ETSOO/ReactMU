import { Box, Stack, SxProps, Theme, useMediaQuery } from "@mui/material";
import React from "react";
import {
  GridOnScrollProps,
  ListChildComponentProps,
  ListOnScrollProps,
  VariableSizeGrid
} from "react-window";
import {
  GridColumn,
  GridJsonData,
  GridLoadDataProps,
  GridLoaderStates,
  GridMethodRef,
  GridTemplateType,
  ReactUtils,
  ScrollerListRef,
  useCombinedRefs,
  useDimensions
} from "@etsoo/react";
import { DataGridEx, DataGridExProps } from "./DataGridEx";
import { MUGlobal } from "./MUGlobal";
import { PullToRefreshUI } from "./PullToRefreshUI";
import {
  ScrollerListEx,
  ScrollerListExInnerItemRendererProps,
  ScrollerListExItemSize
} from "./ScrollerListEx";
import { SearchBar } from "./SearchBar";
import { Labels } from "./app/Labels";
import { GridUtils } from "./GridUtils";

/**
 * ResponsibleContainer props
 */
export type ResponsibleContainerProps<T extends object, F> = Omit<
  DataGridExProps<T>,
  | "height"
  | "itemKey"
  | "loadData"
  | "mRef"
  | "onScroll"
  | "onItemsRendered"
  | "onInitLoad"
  | "onUpdateRows"
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
    data: GridJsonData & GridTemplateType<F>,
    lastItem?: T
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

  // Search data
  const searchData = GridUtils.getSearchData(cacheKey);

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

  const onInitLoad = (
    ref: VariableSizeGrid<T> | ScrollerListRef
  ): [T[], Partial<GridLoaderStates<T>>?] | null | undefined => {
    // Avoid repeatedly load from cache
    if (refs.current.initLoaded || !cacheKey) return undefined;

    // Cache data
    const cacheData = GridUtils.getCacheData<T>(cacheKey, cacheMinutes);
    if (cacheData) {
      const { rows, state } = cacheData;

      GridUtils.mergeSearchData(state, searchData);

      // Scroll position
      const scrollData = sessionStorage.getItem(`${cacheKey}-scroll`);
      if (scrollData) {
        if ("resetAfterColumnIndex" in ref) {
          const { scrollLeft, scrollTop } = JSON.parse(
            scrollData
          ) as GridOnScrollProps;

          globalThis.setTimeout(
            () => ref.scrollTo({ scrollLeft, scrollTop }),
            0
          );
        } else {
          const { scrollOffset } = JSON.parse(scrollData) as ListOnScrollProps;

          globalThis.setTimeout(() => ref.scrollTo(scrollOffset), 0);
        }
      }

      // Update flag value
      refs.current.initLoaded = true;

      // Return cached rows and state
      return [rows, state];
    }

    return undefined;
  };

  const onListScroll = (props: ListOnScrollProps) => {
    if (!cacheKey || !refs.current.initLoaded) return;
    sessionStorage.setItem(`${cacheKey}-scroll`, JSON.stringify(props));
  };
  const onGridScroll = (props: GridOnScrollProps) => {
    if (!cacheKey || !refs.current.initLoaded) return;
    sessionStorage.setItem(`${cacheKey}-scroll`, JSON.stringify(props));
  };

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
      // Delete
      delete rest.itemRenderer;

      return (
        <Box className="DataGridBox">
          <DataGridEx<T>
            autoLoad={!hasFields}
            height={heightLocal}
            width={rect.width}
            loadData={localLoadData}
            mRef={mRefs}
            onDoubleClick={(_, data) => quickAction && quickAction(data)}
            outerRef={(element?: HTMLDivElement) => {
              if (element != null && elementReady) elementReady(element, true);
            }}
            onScroll={onGridScroll}
            columns={columns}
            onUpdateRows={GridUtils.getUpdateRowsHandler<T>(cacheKey)}
            onInitLoad={onInitLoad}
            {...rest}
          />
        </Box>
      );
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

    return (
      <Box className="ListBox" sx={{ height: heightLocal }}>
        <ScrollerListEx<T>
          autoLoad={!hasFields}
          height={heightLocal}
          loadData={localLoadData}
          onUpdateRows={GridUtils.getUpdateRowsHandler<T>(cacheKey)}
          onInitLoad={onInitLoad}
          mRef={mRefs}
          onClick={(event, data) =>
            quickAction && ReactUtils.isSafeClick(event) && quickAction(data)
          }
          oRef={(element) => {
            if (element != null && elementReady) elementReady(element, false);
          }}
          onScroll={onListScroll}
          {...rest}
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

    const f = typeof fields == "function" ? fields(searchData ?? {}) : fields;

    return (
      <SearchBar
        fields={f}
        onSubmit={onSubmit}
        className={`searchBar${showDataGrid ? "Grid" : "List"}`}
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
