import type { GridJsonData, GridLoader } from "@etsoo/react";
import type { DataTypes } from "@etsoo/shared";
import type { CommonPageProps } from "./CommonPage";

/**
 * Search page props
 */
export type SearchPageProps<
  T extends object,
  F extends DataTypes.BasicTemplate
> = Omit<GridLoader<T>, "loadData"> & {
  /**
   * Cache key
   */
  cacheKey?: string;

  /**
   * Cache minutes
   */
  cacheMinutes?: number;

  /**
   * Search fields
   */
  fields:
    | React.ReactElement[]
    | ((data: DataTypes.BasicTemplateType<F>) => React.ReactElement[]);

  /**
   * Search field template
   */
  fieldTemplate?: F;

  /**
   * Load data callback
   */
  loadData: (
    data: GridJsonData & DataTypes.BasicTemplateType<F>,
    lastItem?: T
  ) => PromiseLike<T[] | null | undefined>;

  /**
   * Page props
   */
  pageProps?: CommonPageProps;

  /**
   * Size ready to read miliseconds span
   * @default 100
   */
  sizeReadyMiliseconds?: number;

  /**
   * SearchBar height
   */
  searchBarHeight?: number;
};
