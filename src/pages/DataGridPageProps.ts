import type { DataTypes } from "@etsoo/shared";
import type { DataGridExProps } from "../DataGridEx";
import type { SearchPageProps } from "./SearchPageProps";

/**
 * DataGrid page props
 */
export type DataGridPageProps<
  T extends object,
  F extends DataTypes.BasicTemplate
> = SearchPageProps<T, F> &
  DataGridExProps<T> & {
    /**
     * Height will be deducted
     * @param height Current calcuated height
     * @param rect Current rect data
     */
    adjustHeight?: (height: number, rect: DOMRect) => number;

    /**
     * Grid height
     */
    height?: number;
  };
