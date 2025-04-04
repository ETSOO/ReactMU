import {
  GridLoadDataProps,
  GridLoaderStates,
  ListOnScrollProps,
  ScrollerListForwardRef,
  ScrollerListRef,
  useCombinedRefs,
  useDimensions,
  useSearchParamsWithCache
} from "@etsoo/react";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { ScrollerListEx, ScrollerListExProps } from "../ScrollerListEx";
import { SearchBar } from "../SearchBar";
import { CommonPage } from "./CommonPage";
import { GridUtils } from "../GridUtils";
import type { SearchPageProps } from "./SearchPageProps";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

/**
 * List page props
 */
export type ListPageProps<T extends object, F> = SearchPageProps<T, F> &
  Omit<ScrollerListExProps<T>, "loadData">;

/**
 * List page
 * @param props Props
 * @returns Component
 */
export function ListPage<T extends object, F>(props: ListPageProps<T, F>) {
  // Destruct
  const {
    fields,
    fieldTemplate,
    loadData,
    mRef,
    pageProps = {},
    cacheKey,
    cacheMinutes = 15,
    sizeReadyMiliseconds = 0,
    searchBarTop,
    ...rest
  } = props;

  pageProps.paddings ??= MUGlobal.pagePaddings;

  // States
  const [states] = React.useState<{
    data?: FormData;
    ref?: ScrollerListForwardRef<T>;
  }>({});

  const refs = useCombinedRefs(mRef, (ref: ScrollerListForwardRef<T>) => {
    if (ref == null) return;

    const first = states.ref == null;

    states.ref = ref;

    if (first) reset();
  });

  const initLoadedRef = React.useRef<boolean>();

  const reset = () => {
    if (states.data == null || states.ref == null) return;
    states.ref.reset({ data: states.data });
  };

  // On submit callback
  const onSubmit = (data: FormData, _reset: boolean) => {
    states.data = data;
    reset();
  };

  const localLoadData = (props: GridLoadDataProps, lastItem?: T) => {
    return loadData(
      GridUtils.createLoader(props, fieldTemplate, cacheKey, false),
      lastItem
    );
  };

  // Watch container
  const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
  const rect = dimensions[0][2];

  // Search data
  const searchData = useSearchParamsWithCache(cacheKey);

  const onInitLoad = (
    ref: ScrollerListRef
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

  const f = typeof fields == "function" ? fields(searchData ?? {}) : fields;

  // Layout
  return (
    <CommonPage {...pageProps} scrollContainer={globalThis}>
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
        <ScrollerListEx<T>
          autoLoad={false}
          loadData={localLoadData}
          onUpdateRows={GridUtils.getUpdateRowsHandler<T>(cacheKey)}
          onInitLoad={onInitLoad}
          onScroll={onListScroll}
          mRef={refs}
          {...rest}
        />
      </Stack>
    </CommonPage>
  );
}
