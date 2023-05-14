import { GridLoaderStates } from "@etsoo/react";

/**
 * Grid data cache type
 */
export type GridDataCacheType<T> = {
  rows: T[];
  state: GridLoaderStates<T>;
  creation: number;
};
