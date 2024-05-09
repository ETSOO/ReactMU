import {
  GridAlignGet,
  GridCellFormatterProps,
  GridColumn,
  GridLoadDataProps,
  GridLoader,
  GridLoaderPartialStates,
  GridLoaderStates,
  GridSizeGet
} from "@etsoo/react";
import { GridMethodRef } from "@etsoo/react/lib/components/GridMethodRef";
import { DataTypes, IdDefaultType } from "@etsoo/shared";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TablePagination,
  TableProps,
  TableRow,
  TableSortLabel,
  useTheme
} from "@mui/material";
import React from "react";
import { DataGridRenderers } from "./DataGridRenderers";

/**
 * Extended table min width for width-unset column
 */
export const TableExMinWidth: number = 180;

/**
 * Extended table methods ref
 */
export interface TableExMethodRef<T> extends GridMethodRef<T> {
  /**
   * Refresh data
   */
  refresh(): void;
}

/**
 * Extended table props
 */
export type TableExProps<
  T extends object,
  D extends DataTypes.Keys<T>
> = TableProps &
  GridLoader<T> & {
    /**
     * Alternating colors for odd/even rows
     */
    alternatingColors?: [string?, string?];

    /**
     * Columns
     */
    columns: GridColumn<T>[];

    /**
     * Header cells background color and font color
     */
    headerColors?: [string?, string?];

    /**
     * Id field
     */
    idField?: D;

    /**
     * Max height
     */
    maxHeight?: number;

    /**
     * Methods
     */
    mRef?: React.Ref<TableExMethodRef<T>>;

    /**
     * On items select change
     */
    onSelectChange?: (selectedItems: T[]) => void;

    /**
     * Row height
     */
    rowHeight?: number;

    /**
     * Header and bottom height
     */
    otherHeight?: number;
  };

/**
 * Extended Table
 * @param props Props
 * @returns Component
 */
export function TableEx<
  T extends object,
  D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: TableExProps<T, D>) {
  // Theme
  const theme = useTheme();

  // Destruct
  const {
    alternatingColors = [theme.palette.action.hover, undefined],
    autoLoad = true,
    columns,
    defaultOrderBy,
    headerColors = [undefined, undefined],
    idField = "id" as D,
    loadBatchSize,
    loadData,
    maxHeight,
    mRef,
    onSelectChange,
    rowHeight = 53,
    otherHeight = 110,
    threshold,
    ...rest
  } = props;

  const selectable: boolean = onSelectChange != null;

  // Rows per page
  let rowsPerPageLocal: number;
  if (maxHeight != null) {
    if (loadBatchSize != null)
      rowsPerPageLocal = GridSizeGet(loadBatchSize, maxHeight);
    else rowsPerPageLocal = Math.floor((maxHeight - otherHeight) / rowHeight);
  } else if (typeof loadBatchSize === "number") {
    rowsPerPageLocal = loadBatchSize;
  } else {
    rowsPerPageLocal = 10;
  }

  // Rows
  const [rows, updateRows] = React.useState<T[]>([]);
  const setRows = (rows: T[]) => {
    state.loadedItems = rows.length;
    updateRows(rows);
  };

  var orderByAsc = defaultOrderBy
    ? columns.find((column) => column.field === defaultOrderBy)?.sortAsc
    : undefined;

  // States
  const stateRefs = React.useRef<GridLoaderStates<T>>({
    queryPaging: {
      currentPage: 0,
      orderBy: defaultOrderBy,
      orderByAsc,
      batchSize: rowsPerPageLocal
    },
    autoLoad,
    loadedItems: 0,
    hasNextPage: true,
    isNextPageLoading: false,
    selectedItems: [],
    idCache: {}
  });
  const state = stateRefs.current;

  // Reset the state and load again
  const reset = (add?: GridLoaderPartialStates<T>) => {
    const { queryPaging, ...rest } = add ?? {};
    const resetState: GridLoaderPartialStates<T> = {
      queryPaging: {
        currentPage: 0,
        ...queryPaging
      },
      autoLoad: true,
      loadedItems: 0,
      hasNextPage: true,
      isNextPageLoading: false,
      lastLoadedItems: undefined,
      ...rest
    };
    Object.assign(state, resetState);
  };

  React.useImperativeHandle(
    mRef,
    () => ({
      delete(index) {
        const item = rows.at(index);
        if (item) {
          const newRows = [...rows];
          newRows.splice(index, 1);
          setRows(newRows);
        }
        return item;
      },
      insert(item, start) {
        const newRows = [...rows];
        newRows.splice(start, 0, item);
        setRows(newRows);
      },
      /**
       * Refresh data
       */
      refresh(): void {
        loadDataLocal();
      },

      /**
       * Reset
       */
      reset,
      scrollToRef(scrollOffset: number): void {
        // Not implemented
      },

      scrollToItemRef(index: number): void {
        // Not implemented
      }
    }),
    []
  );

  // Load data
  const loadDataLocal = () => {
    // Prevent multiple loadings
    if (!state.hasNextPage || state.isNextPageLoading) return;

    // Update state
    state.isNextPageLoading = true;

    // Parameters
    const { queryPaging, data, isMounted } = state;

    const loadProps: GridLoadDataProps = {
      queryPaging,
      data
    };

    loadData(loadProps).then((result) => {
      state.isMounted = true;
      if (result == null || isMounted === false) {
        return;
      }

      const newItems = result.length;
      state.lastLoadedItems = newItems;
      state.hasNextPage = newItems >= queryPaging.batchSize;
      state.isNextPageLoading = false;

      // Update rows
      setRows(result);
    });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    state.hasNextPage = true;
    state.queryPaging.currentPage = newPage;
    loadDataLocal();
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const batchSize = parseInt(event.target.value);
    reset({ queryPaging: { batchSize } });
  };

  const handleSelect = (item: T, checked: Boolean) => {
    const selectedItems = state.selectedItems;

    const index = selectedItems.findIndex(
      (selectedItem) => selectedItem[idField] === item[idField]
    );
    if (checked) {
      if (index === -1) selectedItems.push(item);
    } else {
      if (index !== -1) selectedItems.splice(index, 1);
    }

    if (onSelectChange != null) {
      onSelectChange(selectedItems);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const selectedItems = state.selectedItems;

    rows.forEach((row) => {
      const index = selectedItems.findIndex(
        (selectedItem) => selectedItem[idField] === row[idField]
      );

      if (checked) {
        if (index === -1) selectedItems.push(row);
      } else if (index !== -1) {
        selectedItems.splice(index, 1);
      }
    });

    if (onSelectChange != null) {
      onSelectChange(selectedItems);
    }
  };

  // New sort
  const handleSort = (field: string, asc?: boolean) => {
    reset({ queryPaging: { orderBy: field, orderByAsc: asc } });
  };

  // Set items for rerenderer
  const setItems = (callback: (items: T[]) => T[] | undefined | void) => {
    const result = callback(rows);
    if (result == null) return;
    setRows(result);
  };

  // Destruct states
  const {
    queryPaging,
    autoLoad: stateAutoLoad,
    hasNextPage,
    lastLoadedItems,
    selectedItems
  } = state;

  const currentPage = queryPaging.currentPage;
  const batchSize = queryPaging.batchSize;

  // Current page selected items
  const pageSelectedItems = selectable
    ? rows.reduce((previousValue, currentItem) => {
        if (
          selectedItems.some((item) => item[idField] === currentItem[idField])
        )
          return previousValue + 1;

        return previousValue;
      }, 0)
    : 0;

  // Total rows
  const totalRows = hasNextPage
    ? -1
    : currentPage * batchSize + (lastLoadedItems ?? 0);

  // Auto load data when current page is 0
  if (currentPage === 0 && stateAutoLoad && lastLoadedItems == null)
    loadDataLocal();

  React.useEffect(() => {
    return () => {
      state.isMounted = false;
    };
  }, []);

  // Layout
  return (
    <Paper>
      <TableContainer sx={{ maxHeight }}>
        <Table {...rest}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: headerColors[0],
                  color: headerColors[1]
                }
              }}
            >
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      pageSelectedItems > 0 && pageSelectedItems < rows.length
                    }
                    checked={pageSelectedItems > 0}
                    onChange={(_event, checked) => handleSelectAll(checked)}
                  />
                </TableCell>
              )}
              {columns.map((column, index) => {
                // Destruct
                const {
                  align,
                  field,
                  header,
                  minWidth,
                  sortable,
                  sortAsc = true,
                  type,
                  width
                } = column;

                // Header text
                const headerText = header ?? field;

                // Sortable
                let sortLabel: React.ReactNode;
                if (sortable && field != null) {
                  const active = queryPaging.orderBy === field;

                  sortLabel = (
                    <TableSortLabel
                      active={active}
                      direction={sortAsc ? "asc" : "desc"}
                      onClick={(_event) => {
                        if (active) column.sortAsc = !sortAsc;

                        handleSort(field, column.sortAsc);
                      }}
                    >
                      {headerText}
                    </TableSortLabel>
                  );
                } else {
                  sortLabel = headerText;
                }

                return (
                  <TableCell
                    align={GridAlignGet(align, type)}
                    key={field ?? index.toString()}
                    width={width}
                    sx={{
                      minWidth:
                        minWidth == null
                          ? width == null
                            ? TableExMinWidth
                            : undefined
                          : minWidth
                    }}
                  >
                    {sortLabel}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              "& tr:nth-of-type(odd):not(.Mui-selected)": {
                backgroundColor: alternatingColors[0]
              },
              "& tr:nth-of-type(even):not(.Mui-selected)": {
                backgroundColor: alternatingColors[1]
              }
            }}
          >
            {[...Array(queryPaging.batchSize)].map((_item, rowIndex) => {
              // Row
              const row = rowIndex < rows.length ? rows[rowIndex] : undefined;

              // Row id field value
              const rowId = DataTypes.getValue(row, idField) ?? rowIndex;

              // Selected or not
              const isItemSelected = selectable
                ? selectedItems.some((item) => item[idField] === rowId)
                : false;

              return (
                <TableRow
                  key={rowId as unknown as React.Key}
                  selected={isItemSelected}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      {row && (
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={(_event, checked) =>
                            handleSelect(row, checked)
                          }
                        />
                      )}
                    </TableCell>
                  )}
                  {columns.map(
                    (
                      {
                        align,
                        cellRenderer = DataGridRenderers.defaultCellRenderer,
                        field,
                        type,
                        valueFormatter
                      },
                      columnIndex
                    ) => {
                      const formatProps: GridCellFormatterProps<T> = {
                        data: row,
                        field,
                        rowIndex,
                        columnIndex
                      };

                      const cellProps: TableCellProps = {
                        align: GridAlignGet(align, type),
                        valign: "middle"
                      };

                      const child = row ? (
                        cellRenderer({
                          data: row,
                          field,
                          formattedValue: valueFormatter
                            ? valueFormatter(formatProps)
                            : undefined,
                          selected: isItemSelected,
                          type,
                          rowIndex,
                          columnIndex,
                          cellProps,
                          setItems
                        })
                      ) : (
                        <React.Fragment>&nbsp;</React.Fragment>
                      );

                      return (
                        <TableCell
                          key={`${rowId}${columnIndex}`}
                          {...cellProps}
                        >
                          {child}
                        </TableCell>
                      );
                    }
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        showFirstButton
        count={totalRows}
        rowsPerPage={batchSize}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[
          batchSize,
          2 * batchSize,
          5 * batchSize,
          10 * batchSize
        ]}
      />
    </Paper>
  );
}
