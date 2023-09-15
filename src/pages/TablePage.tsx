import {
  GridLoadDataProps,
  useCombinedRefs,
  useDimensions
} from "@etsoo/react";
import { DataTypes, IdDefaultType } from "@etsoo/shared";
import { Box, Stack } from "@mui/material";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { SearchBar } from "../SearchBar";
import { TableEx, TableExMethodRef, TableExMinWidth } from "../TableEx";
import { CommonPage, CommonPageScrollContainer } from "./CommonPage";
import { TablePageProps } from "./TablePageProps";
import { GridUtils } from "../GridUtils";

/**
 * Table page
 * @param props Props
 * @returns Component
 */
export function TablePage<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
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

  const localLoadData = (props: GridLoadDataProps) => {
    return loadData(GridUtils.createLoader<F>(props, fieldTemplate, cacheKey));
  };

  // Search data
  const searchData = GridUtils.getSearchData<F>(cacheKey);

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
    <CommonPage {...pageProps} scrollContainer={CommonPageScrollContainer}>
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
