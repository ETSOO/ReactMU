import type { GridJsonData, GridLoader, GridTemplateType } from "@etsoo/react";
import type { CommonPageProps } from "./CommonPage";

/**
 * Search page props
 */
export type SearchPageProps<T extends object, F> = GridLoader<
  T,
  GridJsonData & GridTemplateType<F>
> & {
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
    | ((data: GridTemplateType<F>) => React.ReactElement[]);

  /**
   * Search field template
   */
  readonly fieldTemplate: F;

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

  /**
   * SearchBar top
   */
  searchBarTop?: number | true;
};
