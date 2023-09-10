import { ListType2 } from "@etsoo/shared";
import { GridApiCommunity } from "@mui/x-data-grid/models/api/gridApiCommunity";

/**
 * MU utilities
 */
export namespace MUUtils {
  /**
   * Get ListType2 item label
   * @param item Item
   * @returns Result
   */
  export function getListItemLabel(item: ListType2) {
    return "label" in item
      ? item.label
      : "name" in item
      ? item.name
      : item.title;
  }

  /**
   * Get grid data
   * @param grid Grid
   * @param checkField Check field or callback
   * @returns Results
   */
  export function getGridData<T>(
    grid: GridApiCommunity,
    checkField: keyof T | ((item: T) => boolean)
  ) {
    const check =
      typeof checkField === "function"
        ? checkField
        : (item: T) => {
            const value = item[checkField];
            return value == null || value === "" ? false : true;
          };

    const items: T[] = [];
    for (const [_, value] of grid.getRowModels()) {
      const item = value as T;
      if (check(item)) {
        items.push(item);
      }
    }
    return items;
  }
}
