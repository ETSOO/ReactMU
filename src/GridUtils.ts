import {
  GridDataGetData,
  GridLoadDataProps,
  GridLoaderStates
} from "@etsoo/react";
import { DataTypes } from "@etsoo/shared";
import { GridDataCacheType } from "./GridDataCacheType";

/**
 * Grid utilities
 */
export namespace GridUtils {
  /**
   * Create data loader
   * @param props Props
   * @param template Field template
   * @param cacheKey Cache key
   * @param keepSource Keep source or not
   * @returns Request data
   */
  export function createLoader<const F>(
    props: GridLoadDataProps,
    template?: F,
    cacheKey?: string,
    keepSource?: boolean
  ) {
    const { data, ...rest } = props;
    const formData = GridDataGetData(data, template, keepSource);

    if (cacheKey)
      sessionStorage.setItem(`${cacheKey}-searchbar`, JSON.stringify(formData));

    return { ...formData, ...rest };
  }

  /**
   * Get cache data
   * @param cacheKey Cache key
   * @param cacheMinutes Cache minutes
   * @returns
   */
  export function getCacheData<T>(cacheKey: string, cacheMinutes: number) {
    const cacheSource = sessionStorage.getItem(cacheKey);
    if (cacheSource) {
      const cacheData = JSON.parse(cacheSource) as GridDataCacheType<T>;
      if (new Date().valueOf() - cacheData.creation > cacheMinutes * 60000) {
        sessionStorage.removeItem(`${cacheKey}-searchbar`);
        sessionStorage.removeItem(cacheKey);
        return;
      }
      return cacheData;
    }
  }

  /**
   * Get search data
   * @param cacheKey Cache key
   * @returns Result
   */
  export function getSearchData(cacheKey?: string) {
    if (cacheKey) {
      const data = sessionStorage.getItem(`${cacheKey}-searchbar`);
      if (data) {
        return JSON.parse(data);
      }
    }
  }

  /**
   * Get update rows handler
   * @param cacheKey Cache key
   * @returns Handler
   */
  export function getUpdateRowsHandler<T extends object>(cacheKey?: string) {
    return (rows: T[], state: GridLoaderStates<T>) => {
      const page = state.queryPaging.currentPage ?? 0;
      if (page > 0 && cacheKey) {
        const data: GridDataCacheType<T> = {
          rows,
          state,
          creation: new Date().valueOf()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }
    };
  }

  /**
   * Merget search date to state
   * @param state State
   * @param searchData Search data
   */
  export function mergeSearchData<T, F extends DataTypes.BasicTemplate>(
    state: GridLoaderStates<T>,
    searchData?: DataTypes.BasicTemplateType<F>
  ) {
    if (searchData == null) return;
    state.data ??= {};
    Object.assign(state.data, searchData);
  }
}
