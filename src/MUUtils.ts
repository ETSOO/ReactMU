import { QueryRQ } from "@etsoo/appscript";
import { IdType } from "@etsoo/shared";
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

  /**
   * Setup paging keysets
   * @param data Paging data
   * @param lastItem Last item of the query
   * @param idField Id field
   */
  export function setupPagingKeysets<T, K extends IdType = number>(
    data: QueryRQ<K>,
    lastItem: T | undefined,
    idField: keyof T & string
  ) {
    // If the id field is not set for ordering, add it with descending
    if (typeof data.queryPaging === "object") {
      const orderBy = (data.queryPaging.orderBy ??= []);
      const idUpper = idField.toUpperCase();
      if (!orderBy.find((o) => o.field.toUpperCase() === idUpper)) {
        orderBy.push({ field: idField, desc: true, unique: true });
      }

      // Set the paging keysets
      if (lastItem) {
        const keysets = orderBy.map((o) => Reflect.get(lastItem, o.field));
        data.queryPaging.keysets = keysets;
      } else {
        data.queryPaging.keysets = undefined;
      }
    }

    return data;
  }
}
