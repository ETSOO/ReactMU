import {
  GridLoadDataProps,
  GridLoaderStates,
  GridOnScrollProps,
  ScrollerGridForwardRef,
  VariableSizeGrid,
  useCombinedRefs,
  useDimensions,
  useSearchParamsWithCache
} from "@etsoo/react";
import React from "react";
import { DataGridEx } from "../DataGridEx";
import { MUGlobal } from "../MUGlobal";
import { SearchBar } from "../SearchBar";
import { CommonPage } from "./CommonPage";
import type { DataGridPageProps } from "./DataGridPageProps";
import { GridUtils } from "../GridUtils";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

interface LocalStates<T> {
  data?: FormData;
  element?: HTMLElement;
  height?: number;
  ref?: ScrollerGridForwardRef<T>;
}

/**
 * DataGrid page
 * @param props Props
 * @returns Component
 */
export function DataGridPage<T extends object, F>(
  props: DataGridPageProps<T, F>
) {
  // Destruct
  const {
    adjustHeight,
    fields,
    fieldTemplate,
    height,
    loadData,
    mRef,
    sizeReadyMiliseconds = 100,
    pageProps = {},
    cacheKey,
    cacheMinutes = 15,
    searchBarTop,
    ...rest
  } = props;

  pageProps.paddings ??= MUGlobal.pagePaddings;

  // States
  const [states, setStates] = React.useReducer(
    (currentState: LocalStates<T>, newState: Partial<LocalStates<T>>) => {
      return { ...currentState, ...newState };
    },
    {
      height
    }
  );

  const refs = useCombinedRefs<ScrollerGridForwardRef<T>>(
    mRef,
    (ref: ScrollerGridForwardRef<T> | null | undefined) => {
      if (ref == null) return;
      states.ref = ref;
      //setStates({ ref });
    }
  );

  const initLoadedRef = React.useRef<boolean>(null);

  // On submit callback
  const onSubmit = (data: FormData, _reset: boolean) => {
    setStates({ data });
  };

  const localLoadData = (props: GridLoadDataProps, lastItem?: T) => {
    return loadData(
      GridUtils.createLoader(props, fieldTemplate, cacheKey, false),
      lastItem
    );
  };

  // Search data
  const searchData = useSearchParamsWithCache(cacheKey);

  const onInitLoad = (
    ref: VariableSizeGrid<T>
  ): [T[], Partial<GridLoaderStates<T>>?] | null | undefined => {
    // Avoid repeatedly load from cache
    if (initLoadedRef.current || !cacheKey) return undefined;

    // Cache data
    const cacheData = GridUtils.getCacheData<T>(cacheKey, cacheMinutes);
    if (cacheData) {
      const { rows, state } = cacheData;

      GridUtils.mergeSearchData(state, searchData);

      // Scroll position
      const scrollData = sessionStorage.getItem(`${cacheKey}-scroll`);
      if (scrollData) {
        const { scrollLeft, scrollTop } = JSON.parse(
          scrollData
        ) as GridOnScrollProps;

        globalThis.setTimeout(() => ref.scrollTo({ scrollLeft, scrollTop }), 0);
      }

      // Update flag value
      initLoadedRef.current = true;

      // Return cached rows and state
      return [rows, state];
    }

    return undefined;
  };

  const onGridScroll = (props: GridOnScrollProps) => {
    if (!cacheKey || !initLoadedRef.current) return;
    sessionStorage.setItem(`${cacheKey}-scroll`, JSON.stringify(props));
  };

  // Watch container
  const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
  const rect = dimensions[0][2];

  React.useEffect(() => {
    if (rect != null && rect.height > 50 && height == null) {
      let gridHeight =
        document.documentElement.clientHeight -
        Math.round(rect.top + rect.height + 1);

      const style = window.getComputedStyle(dimensions[0][1]!);
      const paddingBottom = parseFloat(style.paddingBottom);
      if (!isNaN(paddingBottom)) gridHeight -= paddingBottom;

      if (adjustHeight != null)
        gridHeight -=
          typeof adjustHeight === "number"
            ? adjustHeight
            : adjustHeight(gridHeight, rect);

      if (gridHeight !== states.height) setStates({ height: gridHeight });
    }
  }, [rect]);

  const list = React.useMemo(() => {
    const gridHeight = states.height;
    if (gridHeight == null) return;

    return (
      <DataGridEx<T>
        autoLoad={false}
        height={gridHeight}
        loadData={localLoadData}
        mRef={refs}
        onUpdateRows={GridUtils.getUpdateRowsHandler<T>(cacheKey)}
        onInitLoad={onInitLoad}
        onScroll={onGridScroll}
        outerRef={(element?: HTMLDivElement) => {
          if (element != null) setStates({ element });
        }}
        {...rest}
      />
    );
  }, [states.height]);

  const { ref, data } = states;
  React.useEffect(() => {
    if (ref == null || data == null) return;
    ref.reset({ data });
  }, [ref, data]);

  const f = typeof fields == "function" ? fields(searchData ?? {}) : fields;

  // Layout
  return (
    <CommonPage {...pageProps} scrollContainer={states.element}>
      <Stack>
        <Box
          ref={dimensions[0][0]}
          sx={{
            paddingBottom: pageProps.paddings
          }}
        >
          {rect && rect.width > 100 && (
            <SearchBar
              fields={f}
              onSubmit={onSubmit}
              top={searchBarTop}
              width={rect.width}
            />
          )}
        </Box>
        {list}
      </Stack>
    </CommonPage>
  );
}
