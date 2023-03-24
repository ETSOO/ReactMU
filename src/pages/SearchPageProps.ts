import { GridJsonData, GridLoader } from "@etsoo/react";
import { DataTypes } from "@etsoo/shared";
import { CommonPageProps } from "./CommonPageProps";

/**
 * Search page props
 */
export type SearchPageProps<
  T extends object,
  F extends DataTypes.BasicTemplate
> = Omit<GridLoader<T>, "loadData"> & {
  /**
   * Search fields
   */
  fields: React.ReactElement[];

  /**
   * Search field template
   */
  fieldTemplate?: F;

  /**
   * Load data callback
   */
  loadData: (
    data: GridJsonData & DataTypes.BasicTemplateType<F>
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
