import type { DataGridExProps } from "../DataGridEx";
import type { SearchPageProps } from "./SearchPageProps";

/**
 * DataGrid page props
 * Change it to interface extends can find the conflicts quickly
 */
export type DataGridPageProps<T extends object, F> = SearchPageProps<T, F> &
  Omit<
    DataGridExProps<T>,
    "loadData" | "cacheKey" | "cacheMinutes" | "height"
  > & {
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
