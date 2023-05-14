import {
  GridDataGet,
  GridLoadDataProps,
  GridLoaderStates,
  ListOnScrollProps,
  ScrollerListForwardRef,
  ScrollerListRef,
  useCombinedRefs
} from "@etsoo/react";
import { DataTypes, IdDefaultType } from "@etsoo/shared";
import { Box, Stack } from "@mui/material";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { ScrollerListEx } from "../ScrollerListEx";
import { SearchBar } from "../SearchBar";
import { CommonPage, CommonPageScrollContainer } from "./CommonPage";
import { ListPageProps } from "./ListPageProps";
import { GridDataCacheType } from "../GridDataCacheType";

/**
 * List page
 * @param props Props
 * @returns Component
 */
export function ListPage<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: ListPageProps<T, F, D>) {
  // Destruct
  const {
    fields,
    fieldTemplate,
    loadData,
    mRef,
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

  const localLoadData = (props: GridLoadDataProps) => {
    const data = GridDataGet(props, fieldTemplate);
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
    <CommonPage {...pageProps} scrollContainer={CommonPageScrollContainer}>
      <Stack>
        <Box
          sx={{
            paddingBottom: pageProps.paddings
          }}
        >
          <SearchBar fields={f} onSubmit={onSubmit} />
        </Box>
        <ScrollerListEx<T, D>
          autoLoad={false}
          loadData={localLoadData}
          onUpdateRows={onUpdateRows}
          onInitLoad={onInitLoad}
          onScroll={onListScroll}
          mRef={refs}
          {...rest}
        />
      </Stack>
    </CommonPage>
  );
}
