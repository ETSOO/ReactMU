import {
  GridDataGet,
  GridLoadDataProps,
  GridLoaderStates,
  GridOnScrollProps,
  ScrollerGridForwardRef,
  VariableSizeGrid,
  useCombinedRefs,
  useDimensions
} from "@etsoo/react";
import { DataTypes, IdDefaultType } from "@etsoo/shared";
import { Box, Stack } from "@mui/material";
import React from "react";
import { DataGridEx } from "../DataGridEx";
import { MUGlobal } from "../MUGlobal";
import { SearchBar } from "../SearchBar";
import { CommonPage } from "./CommonPage";
import { DataGridPageProps } from "./DataGridPageProps";
import { GridDataCacheType } from "../GridDataCacheType";

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
export function DataGridPage<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: DataGridPageProps<T, F, D>) {
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
    cacheMinutes = 120,
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

  const initLoadedRef = React.useRef<boolean>();

  // On submit callback
  const onSubmit = (data: FormData, _reset: boolean) => {
    setStates({ data });
  };

  const localLoadData = (props: GridLoadDataProps) => {
    const data = GridDataGet(props, fieldTemplate);

    if (cacheKey)
      sessionStorage.setItem(`${cacheKey}-searchbar`, JSON.stringify(data));

    return loadData(data);
  };

  type DataType = GridDataCacheType<T>;

  const onUpdateRows = (rows: T[], state: GridLoaderStates<T>) => {
    if (state.currentPage > 0 && cacheKey) {
      const data: DataType = { rows, state, creation: new Date().valueOf() };
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
  };

  const onInitLoad = (
    ref: VariableSizeGrid<T>
  ): [T[], Partial<GridLoaderStates<T>>?] | null | undefined => {
    // Avoid repeatedly load from cache
    if (initLoadedRef.current || !cacheKey) return undefined;

    // Cache data
    const cacheData = sessionStorage.getItem(cacheKey);
    if (cacheData) {
      const { rows, state, creation } = JSON.parse(cacheData) as DataType;

      // 120 minutes
      if (new Date().valueOf() - creation > cacheMinutes * 60000) {
        sessionStorage.removeItem(cacheKey);
        return undefined;
      }

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

      if (adjustHeight != null) gridHeight -= adjustHeight(gridHeight, rect);

      if (gridHeight !== states.height) setStates({ height: gridHeight });
    }
  }, [rect]);

  const list = React.useMemo(() => {
    const gridHeight = states.height;
    if (gridHeight == null) return;

    return (
      <DataGridEx<T, D>
        autoLoad={false}
        height={gridHeight}
        loadData={localLoadData}
        mRef={refs}
        onUpdateRows={onUpdateRows}
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

  const f =
    typeof fields == "function"
      ? fields(
          JSON.parse(
            sessionStorage.getItem(`${cacheKey}-searchbar`) ?? "{}"
          ) as DataTypes.BasicTemplateType<F>
        )
      : fields;

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
          <SearchBar fields={f} onSubmit={onSubmit} />
        </Box>
        {list}
      </Stack>
    </CommonPage>
  );
}
