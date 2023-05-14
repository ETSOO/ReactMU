import {
  GridDataGet,
  GridLoadDataProps,
  GridLoaderStates,
  ListOnScrollProps,
  ScrollerListForwardRef,
  ScrollerListRef,
  useCombinedRefs,
  useDimensions
} from "@etsoo/react";
import { DataTypes, IdDefaultType } from "@etsoo/shared";
import { Box, Stack } from "@mui/material";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { ScrollerListEx } from "../ScrollerListEx";
import { SearchBar } from "../SearchBar";
import { CommonPage } from "./CommonPage";
import { ListPageProps } from "./ListPageProps";
import { GridDataCacheType } from "../GridDataCacheType";

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function FixedListPage<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(
  props: ListPageProps<T, F, D> & {
    /**
     * Height will be deducted
     * @param height Current calcuated height
     * @param rect Current rect data
     */
    adjustHeight?: (height: number, rect: DOMRect) => number;
  }
) {
  // Destruct
  const {
    adjustHeight,
    fields,
    fieldTemplate,
    loadData,
    mRef,
    sizeReadyMiliseconds = 0,
    pageProps = {},
    cacheKey,
    cacheMinutes = 120,
    ...rest
  } = props;

  pageProps.paddings ??= MUGlobal.pagePaddings;

  // States
  const [states] = React.useState<{
    data?: FormData;
    ref?: ScrollerListForwardRef<T>;
  }>({});

  const initLoadedRef = React.useRef<boolean>();

  // Scroll container
  const [scrollContainer, updateScrollContainer] = React.useState<
    HTMLElement | undefined
  >();

  const refs = useCombinedRefs(
    mRef,
    (ref: ScrollerListForwardRef<T> | null | undefined) => {
      if (ref == null) return;

      const first = states.ref == null;

      states.ref = ref;

      if (first) reset();
    }
  );

  const reset = () => {
    if (states.data == null || states.ref == null) return;
    states.ref.reset({ data: states.data });
  };

  // On submit callback
  const onSubmit = (data: FormData, _reset: boolean) => {
    states.data = data;
    reset();
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
    ref: ScrollerListRef
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
        const { scrollOffset } = JSON.parse(scrollData) as ListOnScrollProps;
        globalThis.setTimeout(() => ref.scrollTo(scrollOffset), 0);
      }

      // Update flag value
      initLoadedRef.current = true;

      // Return cached rows and state
      return [rows, state];
    }

    return undefined;
  };

  const onListScroll = (props: ListOnScrollProps) => {
    if (!cacheKey || !initLoadedRef.current) return;
    sessionStorage.setItem(`${cacheKey}-scroll`, JSON.stringify(props));
  };

  // Watch container
  const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
  const rect = dimensions[0][2];
  const list = React.useMemo(() => {
    if (rect != null && rect.height > 50) {
      let height =
        document.documentElement.clientHeight -
        Math.round(rect.top + rect.height + 1);

      if (adjustHeight != null) height -= adjustHeight(height, rect);

      return (
        <Box
          id="list-container"
          sx={{
            height: height + "px"
          }}
        >
          <ScrollerListEx<T, D>
            autoLoad={false}
            height={height}
            loadData={localLoadData}
            mRef={refs}
            onUpdateRows={onUpdateRows}
            onInitLoad={onInitLoad}
            onScroll={onListScroll}
            oRef={(element) => {
              if (element != null) updateScrollContainer(element);
            }}
            {...rest}
          />
        </Box>
      );
    }
  }, [rect]);

  const f =
    typeof fields == "function"
      ? fields(
          JSON.parse(
            sessionStorage.getItem(`${cacheKey}-searchbar`) ?? "{}"
          ) as DataTypes.BasicTemplateType<F>
        )
      : fields;

  const { paddings, ...pageRest } = pageProps;

  // Layout
  return (
    <CommonPage {...pageRest} paddings={{}} scrollContainer={scrollContainer}>
      <Stack>
        <Box ref={dimensions[0][0]} sx={{ padding: paddings }}>
          <SearchBar fields={f} onSubmit={onSubmit} />
        </Box>
        {list}
      </Stack>
    </CommonPage>
  );
}
