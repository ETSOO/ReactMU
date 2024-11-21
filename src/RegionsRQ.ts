export type RegionsRQ = {
  /**
   * Country id
   */
  id?: string;

  /**
   * Favored country ids from top to bottom
   */
  favoredIds?: string[];

  /**
   * Items count to query
   */
  items?: number;

  /**
   * Filter keyword
   */
  keyword?: string;

  /**
   * Cultrue
   */
  culture?: string;
};
