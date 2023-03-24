import { DataTypes, IdDefaultType } from "@etsoo/shared";
import { DataGridExProps } from "../DataGridEx";
import { SearchPageProps } from "./SearchPageProps";

/**
 * DataGrid page props
 */
export type DataGridPageProps<
  T extends object,
  F extends DataTypes.BasicTemplate,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
> = SearchPageProps<T, F> &
  Omit<DataGridExProps<T, D>, "loadData" | "height"> & {
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
