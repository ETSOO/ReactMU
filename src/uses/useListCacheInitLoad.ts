import {
  ListImperativeAPI,
  OnRowsRenderedData,
  ScrollerListProps,
  useSearchParamsWithCache
} from "@etsoo/react";
import React from "react";
import { GridUtils } from "../GridUtils";
import { ExtendUtils } from "@etsoo/shared";

export function useListCacheInitLoad<T extends object>(
  cacheKey: string | undefined,
  cacheMinutes: number
): ScrollerListProps<T>["onInitLoad"] {
  // Reference
  const ref = React.useRef<boolean>(null);

  // Search data
  const searchData = useSearchParamsWithCache(cacheKey);

  // Avoid repeatedly load from cache
  if (ref.current || !cacheKey) return undefined;

  // Cache data
  const cacheData = GridUtils.getCacheData<T>(cacheKey, cacheMinutes);
  if (cacheData) {
    const { rows, state } = cacheData;

    GridUtils.mergeSearchData(state, searchData);

    // Update flag value
    ref.current = true;

    return (ref: ListImperativeAPI) => {
      // Scroll position
      const scrollData = sessionStorage.getItem(`${cacheKey}-scroll`);
      if (scrollData) {
        const data = JSON.parse(scrollData) as OnRowsRenderedData;
        ExtendUtils.waitFor(
          () => ref.scrollToRow({ index: data.startIndex }),
          100
        );
      }

      // Return cached rows and state
      return [rows, state];
    };
  }

  return undefined;
}
