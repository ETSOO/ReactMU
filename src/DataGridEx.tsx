import { css } from "@emotion/css";
import {
  GridAlignGet,
  GridCellFormatterProps,
  GridCellRendererProps,
  GridColumn,
  GridHeaderCellRendererProps,
  GridJsonData,
  GridLoadDataProps,
  GridLoaderPartialStates,
  GridLoaderStates,
  ScrollerGrid,
  ScrollerGridForwardRef,
  ScrollerGridProps,
  useCombinedRefs
} from "@etsoo/react";
import { DataTypes, Utils } from "@etsoo/shared";
import React from "react";
import { DataGridRenderers } from "./DataGridRenderers";
import { MouseEventWithDataHandler } from "./MUGlobal";
import { useTheme } from "@mui/material/styles";
import Box, { BoxProps } from "@mui/material/Box";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import { GridUtils } from "./GridUtils";
import { useGridCacheInitLoad } from "./uses/useGridCacheInitLoad";

/**
 * Footer item renderer props
 */
export type DataGridExFooterItemRendererProps<T extends object> = {
  column: GridColumn<T>;
  index: number;
  states: GridLoaderStates<T>;
  cellProps: any;
  checkable: boolean;
};

/**
 * Extended DataGrid with VariableSizeGrid props
 */
export type DataGridExProps<
  T extends object,
  P extends GridJsonData = GridLoadDataProps
> = Omit<
  ScrollerGridProps<T, P>,
  | "cellComponent"
  | "columnCount"
  | "columnWidth"
  | "onClick"
  | "onDoubleClick"
  | "onInitLoad"
  | "width"
> & {
  /**
   * Alternating colors for odd/even rows
   */
  alternatingColors?: [string?, string?];

  /**
   * Cache key
   */
  cacheKey?: string;

  /**
   * Cache minutes
   */
  cacheMinutes?: number;

  /**
   * Checkable to choose multiple items
   * @default false
   */
  checkable?: boolean;

  /**
   * Rows count to have the bottom border
   */
  borderRowsCount?: number;

  /**
   * Bottom height
   */
  bottomHeight?: number;

  /**
   * Columns
   */
  columns: GridColumn<T>[];

  /**
   * Footer item renderer
   */
  footerItemRenderer?: (
    rows: T[],
    props: DataGridExFooterItemRendererProps<T>
  ) => React.ReactNode;

  /**
   * Header height
   * @default 56
   */
  headerHeight?: number;

  /**
   * Hide the footer
   * @default false
   */
  hideFooter?: boolean;

  /**
   * Hover color
   */
  hoverColor?: string;

  /**
   * Double click handler
   */
  onDoubleClick?: MouseEventWithDataHandler<T>;

  /**
   * Click handler
   */
  onClick?: MouseEventWithDataHandler<T>;

  /**
   * Data change handler
   * @param rows Rows
   * @param rowIndex Row index
   * @param columnIndex Column index
   */
  onDataChange?: (rows: T[], rowIndex: number, columnIndex: number) => void;

  /**
   * Selectable to support hover over and out effect and row clickable
   * @default true
   */
  selectable?: boolean;

  /**
   * Selected color
   */
  selectedColor?: string;

  /**
   * Width
   */
  width?: number;
};

// Borders
const boldBorder = "2px solid rgba(224, 224, 224, 1)";
const thinBorder = "1px solid rgba(224, 224, 224, 1)";

// Scroll bar size
const scrollbarSize = 16;

// Minimum width
const minWidth = 120;

const createGridStyle = (
  alternatingColors: [string?, string?],
  selectedColor: string,
  hoverColor: string
) => {
  return css({
    ".DataGridEx-Selected": {
      backgroundColor: selectedColor
    },
    ".DataGridEx-Hover:not(.DataGridEx-Selected)": {
      backgroundColor: hoverColor
    },
    "& .DataGridEx-Cell0:not(.DataGridEx-Hover):not(.DataGridEx-Selected)": {
      backgroundColor: alternatingColors[0]
    },
    "& .DataGridEx-Cell1:not(.DataGridEx-Hover):not(.DataGridEx-Selected)": {
      backgroundColor: alternatingColors[1]
    },
    "& .DataGridEx-Cell-Border": {
      borderBottom: thinBorder
    }
  });
};

const rowItems = (
  div: HTMLDivElement,
  callback: (div: HTMLDivElement) => void
) => {
  const row = div.dataset["row"];
  if (div.parentElement == null || row == null) return;
  doRowItems(div.parentElement, parseFloat(row), callback);
};

const doRowItems = (
  parent: HTMLElement,
  rowIndex: number,
  callback: (div: HTMLDivElement) => void
) => {
  if (parent == null || rowIndex == null) return;

  parent
    ?.querySelectorAll<HTMLDivElement>(`div[data-row="${rowIndex}"]`)
    .forEach((rowItem) => {
      callback(rowItem);
    });
};

/**
 * Extended datagrid columns calculation
 * @param columns
 * @returns Total width and unset items
 */
export function DataGridExCalColumns<T>(columns: GridColumn<T>[]) {
  return columns.reduce<{ total: number; unset: number }>(
    (previousValue, currentItem) => {
      previousValue.total +=
        currentItem.width ?? currentItem.minWidth ?? minWidth;
      if (currentItem.width == null) previousValue.unset++;
      return previousValue;
    },
    {
      total: 0,
      unset: 0
    }
  );
}

/**
 * Extended DataGrid with VariableSizeGrid
 * @param props Props
 * @returns Component
 */
export function DataGridEx<T extends object>(props: DataGridExProps<T>) {
  // Theme
  const theme = useTheme();

  const defaultHeaderRenderer = (states: GridLoaderStates<T>) => {
    const { orderBy } = states.queryPaging;
    return (
      <Box
        className="DataGridEx-Header"
        display="flex"
        alignItems="center"
        borderBottom={boldBorder}
        fontWeight={500}
        minWidth={widthCalculator.total}
        height={headerHeight}
      >
        {columns.map((column, index) => {
          // Destruct
          const {
            align,
            field,
            header,
            headerCellRenderer,
            sortable,
            sortAsc = true,
            type
          } = column;

          // Header text
          const headerText = header ?? field;

          // Cell props
          const cellProps: BoxProps = {};

          // Sortable
          let sortLabel: React.ReactNode;
          if (headerCellRenderer) {
            sortLabel = headerCellRenderer({
              cellProps,
              column,
              columnIndex: checkable ? index - 1 : index, // Ignore the checkbox case,
              states
            });
          } else if (sortable && field != null) {
            const active = orderBy?.some(
              (o) => o.field.toUpperCase() === field.toUpperCase()
            );

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
            <Box
              key={field ?? index.toString()}
              textAlign={GridAlignGet(align, type)}
              width={columnWidth(index)}
            >
              <Box
                className="DataGridEx-Cell"
                onMouseEnter={handleMouseEnter}
                {...cellProps}
              >
                {sortLabel}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  function defaultFooterRenderer(rows: T[], states: GridLoaderStates<T>) {
    return (
      <Box
        className="DataGridEx-Footer"
        display="flex"
        alignItems="center"
        borderTop={thinBorder}
        marginTop="1px"
        minWidth={widthCalculator.total}
        height={bottomHeight - 1}
      >
        {columns.map((column, index) => {
          // Destruct
          const { align, field, type } = column;

          // Cell props
          const cellProps: BoxProps = {};

          // Cell
          const cell = footerItemRenderer
            ? footerItemRenderer(rows, {
                column,
                index: checkable ? index - 1 : index, // Ignore the checkbox case
                states,
                cellProps,
                checkable
              })
            : undefined;

          return (
            <Box
              key={"bottom-" + (field ?? index.toString())}
              textAlign={GridAlignGet(align, type)}
              width={columnWidth(index)}
            >
              <Box
                className="DataGridEx-Cell"
                onMouseEnter={handleMouseEnter}
                {...cellProps}
              >
                {cell}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  // Destruct
  const {
    alternatingColors = [theme.palette.grey[100], undefined],
    borderRowsCount,
    bottomHeight = 53,
    cacheKey,
    cacheMinutes = 15,
    checkable = false,
    className,
    columns,
    defaultOrderBy,
    height,
    headerHeight = 56,
    headerRenderer = defaultHeaderRenderer,
    footerRenderer = defaultFooterRenderer,
    footerItemRenderer = DataGridRenderers.defaultFooterItemRenderer,
    hideFooter = false,
    hoverColor = "#f6f9fb",
    idField = "id" as DataTypes.Keys<T>,
    mRef = React.createRef(),
    onClick,
    onDataChange,
    onDoubleClick,
    onUpdateRows,
    selectable = true,
    selectedColor = "#edf4fb",
    width,
    ...rest
  } = props;

  if (checkable) {
    const cbColumn: GridColumn<T> = {
      field: "selected" as any, // Avoid validation from data model
      header: "",
      sortable: false,
      width: 50,
      cellRenderer: ({
        cellProps,
        data,
        selected
      }: GridCellRendererProps<T, BoxProps>) => {
        cellProps.sx = {
          padding: "4px!important"
        };

        return (
          <Checkbox
            color="primary"
            checked={selected}
            onChange={(_event, checked) => {
              refs.current.ref?.selectItem(data, checked);
            }}
          />
        );
      },
      headerCellRenderer: ({
        cellProps,
        states
      }: GridHeaderCellRendererProps<T, BoxProps>) => {
        // 2 = border height
        const hpad = (headerHeight - 42) / 2;
        cellProps.sx = {
          padding: `${hpad}px 4px ${hpad - 1}px 4px!important`
        };

        return (
          <Checkbox
            color="primary"
            indeterminate={
              states.selectedItems.length > 0 &&
              states.selectedItems.length < states.loadedItems
            }
            checked={states.selectedItems.length > 0}
            onChange={(_event, checked) => refs.current.ref?.selectAll(checked)}
          />
        );
      }
    };

    // Update to the latest version
    if (columns[0].field === "selected") {
      columns[0] = cbColumn;
    } else {
      columns.unshift(cbColumn);
    }
  }

  // Init handler
  const initHandler = useGridCacheInitLoad<T>(cacheKey, cacheMinutes);

  const refs = React.useRef<{ ref?: ScrollerGridForwardRef<T> }>({});

  const mRefLocal = useCombinedRefs(mRef, (ref: ScrollerGridForwardRef<T>) => {
    if (ref == null) return;
    refs.current.ref = ref;
  });

  // New sort
  const handleSort = (field: string, asc?: boolean) => {
    reset({
      queryPaging: { orderBy: [{ field, desc: !(asc ?? true) }] }
    });
  };

  // Reset
  const reset = (add: GridLoaderPartialStates<T>) => {
    refs.current.ref?.reset(add);
  };

  // Show hover tooltip for trucated text
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const div = event.currentTarget;
    const { innerText, offsetWidth, scrollWidth } = div;
    if (offsetWidth < scrollWidth) {
      div.title = innerText;
    } else {
      div.title = "";
    }
  };

  // selectedRowIndex state
  const selectedRowIndex = React.useRef(-1);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const div = event.currentTarget;
    const row = div.dataset["row"];
    if (div.parentElement == null || row == null) return;

    const rowIndex = parseFloat(row);

    // No change
    if (isNaN(rowIndex) || rowIndex === selectedRowIndex.current) return;

    if (selectedRowIndex.current != -1) {
      doRowItems(div.parentElement, selectedRowIndex.current, (preDiv) => {
        preDiv.classList.remove("DataGridEx-Selected");
      });
    }

    rowItems(div, (currentDiv) => {
      currentDiv.classList.add("DataGridEx-Selected");
    });

    selectedRowIndex.current = rowIndex;
  };

  const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
    rowItems(event.currentTarget, (div) => {
      div.classList.add("DataGridEx-Hover");
    });
  };

  const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    rowItems(event.currentTarget, (div) => {
      div.classList.remove("DataGridEx-Hover");
    });
  };

  // Column width calculator
  const widthCalculator = React.useMemo(
    () => DataGridExCalColumns(columns),
    [columns]
  );

  // Column width
  const columnWidth = React.useCallback(
    (index: number) => {
      // Ignore null case
      if (width == null) return 0;

      // Column
      const column = columns[index];
      if (column.width != null) return column.width;

      // More space
      const leftWidth =
        width - widthCalculator.total - (width < 800 ? 0 : scrollbarSize);

      // Shared width
      const sharedWidth = leftWidth > 0 ? leftWidth / widthCalculator.unset : 0;

      return (column.minWidth || minWidth) + sharedWidth;
    },
    [columns, width]
  );

  const onUpdateRowsHandler = React.useCallback(
    (rows: T[], state: GridLoaderStates<T>) => {
      GridUtils.getUpdateRowsHandler<T>(cacheKey)?.(rows, state);
      onUpdateRows?.(rows, state);
    },
    [onUpdateRows, cacheKey]
  );

  // Table
  const table = React.useMemo(() => {
    return (
      <ScrollerGrid<T>
        className={Utils.mergeClasses(
          "DataGridEx-Body",
          "DataGridEx-CustomBar",
          className,
          createGridStyle(alternatingColors, selectedColor, hoverColor)
        )}
        onCellsRendered={
          cacheKey
            ? (visibleCells) =>
                sessionStorage.setItem(
                  `${cacheKey}-scroll`,
                  JSON.stringify(visibleCells)
                )
            : undefined
        }
        onInitLoad={initHandler}
        onUpdateRows={onUpdateRowsHandler}
        cellComponent={({ rowIndex, columnIndex, style, rows, states }) => {
          // Column
          const {
            align,
            cellRenderer = DataGridRenderers.defaultCellRenderer,
            cellBoxStyle,
            field,
            type,
            valueFormatter,
            renderProps
          } = columns[columnIndex];

          // Data
          const data = rows[rowIndex];

          // Props
          const formatProps: GridCellFormatterProps<T> = {
            data,
            field,
            rowIndex,
            columnIndex
          };

          let rowClass = `DataGridEx-Cell${rowIndex % 2}`;
          if (
            borderRowsCount != null &&
            borderRowsCount > 0 &&
            (rowIndex + 1) % borderRowsCount === 0
          ) {
            rowClass += ` DataGridEx-Cell-Border`;
          }

          // Selected
          const selected =
            data != null &&
            (selectedRowIndex.current === rowIndex ||
              states.selectedItems.some(
                (selectedItem) =>
                  selectedItem != null &&
                  selectedItem[idField] === data[idField]
              ));

          if (selected) {
            rowClass += ` DataGridEx-Selected`;
          }

          // Box style
          const boxStyle =
            data == null || cellBoxStyle == null
              ? undefined
              : typeof cellBoxStyle === "function"
              ? cellBoxStyle(data)
              : cellBoxStyle;

          const cellProps: BoxProps = {
            className: "DataGridEx-Cell",
            textAlign: GridAlignGet(align, type),
            sx: { ...boxStyle }
          };

          const child = cellRenderer({
            data,
            field,
            formattedValue: valueFormatter
              ? valueFormatter(formatProps)
              : undefined,
            selected,
            type,
            rowIndex,
            columnIndex,
            cellProps,
            renderProps:
              typeof renderProps === "function"
                ? renderProps(data)
                : renderProps,
            triggerChange: () => onDataChange?.(rows, rowIndex, columnIndex)
          });

          return (
            <div
              className={rowClass}
              style={style}
              data-row={rowIndex}
              data-column={columnIndex}
              onMouseDown={
                selectable && !checkable ? handleMouseDown : undefined
              }
              onMouseOver={selectable ? handleMouseOver : undefined}
              onMouseOut={selectable ? handleMouseOut : undefined}
              onClick={(event) =>
                onClick && data != null && onClick(event, data)
              }
              onDoubleClick={(event) =>
                onDoubleClick && data != null && onDoubleClick(event, data)
              }
            >
              <Box {...cellProps} onMouseEnter={handleMouseEnter}>
                {child}
              </Box>
            </div>
          );
        }}
        columnCount={columns.length}
        columnWidth={columnWidth}
        defaultOrderBy={defaultOrderBy}
        height={
          typeof height === "number"
            ? height -
              headerHeight -
              (hideFooter ? 0 : bottomHeight + 1) -
              scrollbarSize
            : height
        }
        headerRenderer={headerRenderer}
        idField={idField}
        footerRenderer={hideFooter ? undefined : footerRenderer}
        width={Math.max(width ?? 0, widthCalculator.total)}
        mRef={mRefLocal}
        {...rest}
      />
    );
  }, [width]);

  return (
    <Paper
      sx={{
        fontSize: "0.875rem",
        height,
        "& .DataGridEx-Cell": {
          padding: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        },
        "& .DataGridEx-CustomBar": {
          "@media (min-width: 800px)": {
            "::-webkit-scrollbar": {
              width: scrollbarSize,
              height: scrollbarSize,
              backgroundColor: "#f6f6f6"
            },
            "::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: "2px"
            },
            "::-webkit-scrollbar-track-piece:start": {
              background: "transparent"
            },
            "::-webkit-scrollbar-track-piece:end": {
              background: "transparent"
            }
          }
        }
      }}
    >
      <div
        className="DataGridEx-CustomBar"
        style={{
          width,
          overflowX: "auto",
          overflowY: "hidden"
        }}
      >
        {table}
      </div>
    </Paper>
  );
}
