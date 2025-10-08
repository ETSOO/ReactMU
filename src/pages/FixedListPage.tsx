import {
  GridLoadDataProps,
  ScrollerListForwardRef,
  useCombinedRefs,
  useDimensions,
  useSearchParamsWithCache
} from "@etsoo/react";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { ScrollerListEx } from "../ScrollerListEx";
import { SearchBar } from "../SearchBar";
import { CommonPage } from "./CommonPage";
import { GridUtils } from "../GridUtils";
import type { ListPageProps } from "./ListPage";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function FixedListPage<T extends object, F>(
  props: ListPageProps<T, F> & {
    /**
     * Height will be deducted
     * @param height Current calcuated height
     * @param rect Current rect data
     */
    adjustHeight?: number | ((height: number, rect: DOMRect) => number);
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
    cacheMinutes = 15,
    searchBarTop,
    ...rest
  } = props;

  pageProps.paddings ??= MUGlobal.pagePaddings;

  // States
  const [states] = React.useState<{
    data?: FormData;
    ref?: ScrollerListForwardRef<T>;
  }>({});

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

      if (ref.element) updateScrollContainer(ref.element);

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

  // Watch container
  const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
  const rect = dimensions[0][2];
  const list = React.useMemo(() => {
    if (rect != null && rect.height > 50) {
      let height =
        document.documentElement.clientHeight -
        Math.round(rect.top + rect.height + 1);

      if (adjustHeight != null)
        height -=
          typeof adjustHeight === "number"
            ? adjustHeight
            : adjustHeight(height, rect);

      return (
        <Box
          id="list-container"
          sx={{
            height: height + "px"
          }}
        >
          <ScrollerListEx<T>
            autoLoad={false}
            height={height}
            loadData={localLoadData}
            mRef={refs}
            {...rest}
          />
        </Box>
      );
    }
  }, [rect]);

  // Search data
  const searchData = useSearchParamsWithCache(cacheKey);

  const f = typeof fields == "function" ? fields(searchData ?? {}) : fields;

  const { paddings, ...pageRest } = pageProps;

  // Layout
  return (
    <CommonPage {...pageRest} paddings={{}} scrollContainer={scrollContainer}>
      <Stack>
        <Box ref={dimensions[0][0]} sx={{ padding: paddings }}>
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
