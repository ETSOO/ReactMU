import { GridJsonData, GridTemplateType } from "@etsoo/react";
import type { DataGridExProps } from "../DataGridEx";
import type { SearchPageProps } from "./SearchPageProps";

/**
 * DataGrid page props
 */
export type DataGridPageProps<T extends object, F> = DataGridExProps<
  T,
  GridJsonData & GridTemplateType<F>
> &
  SearchPageProps<T, F> & {
    /**
     * Height will be deducted
     * @param height Current calcuated height
     * @param rect Current rect data
     */
    adjustHeight?: number | ((height: number, rect: DOMRect) => number);

    /**
     * Grid height
     */
    height?: number;
  };
