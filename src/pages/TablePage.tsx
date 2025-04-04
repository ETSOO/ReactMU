import {
  GridLoadDataProps,
  useCombinedRefs,
  useDimensions,
  useSearchParamsWithCache
} from "@etsoo/react";
import { DataTypes, IdDefaultType } from "@etsoo/shared";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { SearchBar } from "../SearchBar";
import {
  TableEx,
  TableExMethodRef,
  TableExMinWidth,
  TableExProps
} from "../TableEx";
import { CommonPage } from "./CommonPage";
import { GridUtils } from "../GridUtils";
import type { SearchPageProps } from "./SearchPageProps";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

/**
 * Table page props
 */
export type TablePageProps<
  T extends object,
  F,
  D extends DataTypes.Keys<T>
> = SearchPageProps<T, F> & Omit<TableExProps<T, D>, "loadData">;

/**
 * Table page
 * @param props Props
 * @returns Component
 */
export function TablePage<
  T extends object,
  F,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: TablePageProps<T, F, D>) {
  // Destruct
  const {
    columns,
    fields,
    fieldTemplate,
    loadData,
    mRef,
    sizeReadyMiliseconds = 0,
    pageProps = {},
    cacheKey,
    cacheMinutes = 15,
    searchBarTop,
    ...rest
  } = props;

  pageProps.paddings ??= MUGlobal.pagePaddings;

  // States
  const [states] = React.useState<{
    data?: FormData;
    ref?: TableExMethodRef<T>;
  }>({});

  const refs = useCombinedRefs(
    mRef,
    (ref: TableExMethodRef<T> | null | undefined) => {
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

  const localLoadData = (props: GridLoadDataProps, lastItem?: T) => {
    return loadData(
      GridUtils.createLoader(props, fieldTemplate, cacheKey, false),
      lastItem
    );
  };

  // Search data
  const searchData = useSearchParamsWithCache(cacheKey);

  // Total width
  const totalWidth = React.useMemo(
    () =>
      columns.reduce((previousValue, { width, minWidth }) => {
        return previousValue + (width ?? minWidth ?? TableExMinWidth);
      }, 0),
    [columns]
  );

  // Watch container
  const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
  const rect = dimensions[0][2];
  const list = React.useMemo(() => {
    if (rect != null && rect.height > 50 && rect.width >= totalWidth) {
      let maxHeight =
        document.documentElement.clientHeight - (rect.top + rect.height + 1);

      const style = window.getComputedStyle(dimensions[0][1]!);
      const paddingBottom = parseFloat(style.paddingBottom);
      if (!isNaN(paddingBottom)) maxHeight -= paddingBottom;

      return (
        <TableEx<T, D>
          autoLoad={false}
          columns={columns}
          loadData={localLoadData}
          maxHeight={maxHeight}
          mRef={refs}
          {...rest}
        />
      );
    }
  }, [rect]);

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
        {list}
      </Stack>
    </CommonPage>
  );
}
