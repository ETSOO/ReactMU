import { DataTypes } from "@etsoo/shared";
import { ScrollerListExProps } from "../ScrollerListEx";
import { SearchPageProps } from "./SearchPageProps";

/**
 * List page props
 */
export type ListPageProps<
  T extends object,
  F extends DataTypes.BasicTemplate
> = SearchPageProps<T, F> & Omit<ScrollerListExProps<T>, "loadData">;
