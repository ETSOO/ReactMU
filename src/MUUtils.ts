import { ListType2 } from "@etsoo/shared";

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
}
