import {
  GridLoadDataProps,
  ScrollerListForwardRef,
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
          mRef={refs}
          {...rest}
        />
      </Stack>
    </CommonPage>
  );
}
