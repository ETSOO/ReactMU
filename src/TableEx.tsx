import {
  GridAlignGet,
  GridCellFormatterProps,
  GridColumn,
  GridLoadDataProps,
  GridLoader,
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

  // States
  const stateRefs = React.useRef<GridLoaderStates<T>>({
    autoLoad,
    currentPage: 0,
    loadedItems: 0,
    hasNextPage: true,
    isNextPageLoading: false,
    orderBy: defaultOrderBy,
    orderByAsc: defaultOrderBy
      ? columns.find((column) => column.field === defaultOrderBy)?.sortAsc
      : undefined,
    batchSize: rowsPerPageLocal,
    selectedItems: [],
    idCache: {}
  });
  const state = stateRefs.current;

  // Reset the state and load again
  const reset = (add?: Partial<GridLoaderStates<T>>) => {
    const resetState: Partial<GridLoaderStates<T>> = {
      autoLoad: true,
      currentPage: 0,
      loadedItems: 0,
      hasNextPage: true,
      isNextPageLoading: false,
      lastLoadedItems: undefined,
      ...add
    };
    Object.assign(state, resetState);
  };

  React.useImperativeHandle(
    mRef,
    () => ({
      /**
       * Refresh data
       */
      refresh(): void {
        loadDataLocal();
      },

      /**
       * Reset
       */
      reset
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
    const { currentPage, batchSize, orderBy, orderByAsc, data, isMounted } =
      state;

    const loadProps: GridLoadDataProps = {
      currentPage,
      batchSize,
      orderBy,
      orderByAsc,
      data
    };

    loadData(loadProps).then((result) => {
      state.isMounted = true;
      if (result == null || isMounted === false) {
        return;
      }

      const newItems = result.length;
      state.lastLoadedItems = newItems;
      state.hasNextPage = newItems >= batchSize;
      state.isNextPageLoading = false;

      // Update rows
      setRows(result);
    });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    state.hasNextPage = true;
    state.currentPage = newPage;
    loadDataLocal();
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const batchSize = parseInt(event.target.value);
    reset({ batchSize });
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
    reset({ orderBy: field, orderByAsc: asc });
  };

  // Destruct states
  const {
    autoLoad: stateAutoLoad,
    currentPage,
    hasNextPage,
    lastLoadedItems,
    orderBy,
    batchSize,
    selectedItems
  } = state;

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
                  const active = orderBy === field;

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
            {[...Array(batchSize)].map((_item, rowIndex) => {
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
                          setItems: setRows
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
