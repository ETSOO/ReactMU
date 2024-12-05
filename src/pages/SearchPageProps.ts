import type { GridJsonData, GridLoader, GridTemplateType } from "@etsoo/react";
import type { CommonPageProps } from "./CommonPage";

/**
 * Search page props
 */
export type SearchPageProps<T extends object> = Omit<
  GridLoader<T>,
  "loadData"
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
    | ((
        data: GridTemplateType<SearchPageProps<T>["fieldTemplate"]>
      ) => React.ReactElement[]);

  /**
   * Search field template
   */
  readonly fieldTemplate: object;

  /**
   * Load data callback
   */
  loadData: (
    data: GridJsonData & GridTemplateType<SearchPageProps<T>["fieldTemplate"]>,
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
