import { GridApiCommunity } from "@mui/x-data-grid/internals";

/**
 * MU utilities
 */
export namespace MUUtils {
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
