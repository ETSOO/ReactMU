import {
  GridDataGetData,
  GridLoadDataProps,
  GridLoaderStates
} from "@etsoo/react";
import { DataTypes } from "@etsoo/shared";
import { GridDataCacheType } from "./GridDataCacheType";
import { QueryPagingData } from "@etsoo/appscript";

/**
 * Grid utilities
 */
export namespace GridUtils {
  /**
   * Create data loader
   * @param props Props
   * @param template Field template
   * @param cacheKey Cache key
   * @returns Request data
   */
  export function createLoader<F extends DataTypes.BasicTemplate>(
    props: GridLoadDataProps,
    template?: F,
    cacheKey?: string
  ) {
    const { data, ...rest } = props;
    const formData = GridDataGetData(data, template);

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
  export function getSearchData<F extends DataTypes.BasicTemplate>(
    cacheKey?: string
  ) {
    if (cacheKey) {
      const data = sessionStorage.getItem(`${cacheKey}-searchbar`);
      if (data) {
        return JSON.parse(data) as DataTypes.BasicTemplateType<F>;
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

  /**
   * Setup paging keysets
   * @param data Paging data
   * @param lastItem Last item of the query
   * @param idField Id field
   */
  export function setupPagingKeysets<T>(
    data: QueryPagingData,
    lastItem: T | undefined,
    idField: keyof T & string
  ) {
    // If the id field is not set for ordering, add it with descending
    if (data.orderBy == null) {
      data.orderBy = new Map<string, boolean>([[idField, true]]);
    } else if (!data.orderBy.has(idField)) {
      data.orderBy.set(idField, true);
    }

    // Set the paging keysets
    if (lastItem) {
      const keysets: unknown[] = [];
      data.orderBy.forEach((_value, key) =>
        keysets.push(Reflect.get(lastItem, key))
      );
      data.keysets = keysets;
    }
  }
}
