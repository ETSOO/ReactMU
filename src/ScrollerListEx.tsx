import { css } from "@emotion/css";
import {
  GridLoaderStates,
  ScrollerList,
  ScrollerListProps
} from "@etsoo/react";
import { DataTypes, Utils } from "@etsoo/shared";
import React from "react";
import { MouseEventWithDataHandler, MUGlobal } from "./MUGlobal";
import { useTheme } from "@mui/material/styles";
import { GridUtils } from "./GridUtils";
import { useListCacheInitLoad } from "./uses/useListCacheInitLoad";
import Box from "@mui/material/Box";

// Scroll bar size
const scrollbarSize = 16;

// Selected class name
const selectedClassName = "ScrollerListEx-Selected";

const createGridStyle = (
  alternatingColors: [string?, string?],
  selectedColor: string
) => {
  return css({
    "& .ScrollerListEx-Selected": {
      backgroundColor: selectedColor
    },
    "& .ScrollerListEx-Row0:not(.ScrollerListEx-Selected)": {
      backgroundColor: alternatingColors[0]
    },
    "& .ScrollerListEx-Row1:not(.ScrollerListEx-Selected)": {
      backgroundColor: alternatingColors[1]
    },
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
  });
};

// Default margin
// horizon: null means full horizontal margin, -1 means all half, >=0 means left/right
const defaultMargin = (margin: object, horizon?: number | string) => {
  const half = MUGlobal.half(margin);

  if (horizon == null) {
    const half = MUGlobal.half(margin);
    return {
      marginLeft: margin,
      marginRight: margin,
      marginTop: half,
      marginBottom: half
    };
  }

  if (
    (typeof horizon === "number" && horizon >= 0) ||
    (typeof horizon === "string" && /^-?\d+/.test(horizon))
  ) {
    return {
      marginLeft: horizon,
      marginRight: horizon,
      marginTop: half,
      marginBottom: half
    };
  }

  return {
    marginLeft: half,
    marginRight: half,
    marginTop: half,
    marginBottom: half
  };
};

/**
 * Extended ScrollerList inner item renderer props
 */
export type ScrollerListExItemRendererProps<T> = {
  /**
   * Row index
   */
  index: number;

  /**
   * Row data
   */
  data: T;

  /**
   * Style
   */
  style: React.CSSProperties;

  /**
   * Item height
   */
  itemHeight: number;

  /**
   * Item space
   */
  space: number;

  /**
   * Default margins
   */
  margins: object;

  /**
   * Item selected
   */
  selected: boolean;
};

/**
 * Extended ScrollerList ItemSize type
 * 1. Callback function
 * 2. Static sets
 * 3. Dynamic left & right margin calculation
 */
export type ScrollerListExItemSize =
  | ((index: number) => [number, number] | [number, number, object])
  | [number, number]
  | [number, object, (number | string)?];

/**
 * Extended ScrollerList Props
 */
export type ScrollerListExProps<T extends object> = Omit<
  ScrollerListProps<T>,
  "rowComponent" | "rowHeight" | "onClick" | "onDoubleClick" | "onInitLoad"
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
   * Item renderer
   */
  itemRenderer?: (props: ScrollerListExItemRendererProps<T>) => React.ReactNode;

  /**
   * Item size, a function indicates its a variable size list
   */
  itemSize: ScrollerListExItemSize;

  /**
   * Double click handler
   */
  onDoubleClick?: MouseEventWithDataHandler<T>;

  /**
   * Click handler
   */
  onClick?: MouseEventWithDataHandler<T>;

  /**
   * On items select change
   */
  onSelectChange?: (selectedItems: T[]) => void;

  /**
   * Selected color
   */
  selectedColor?: string;
};

/**
 * Extended ScrollerList
 * @param props Props
 * @returns Component
 */
export function ScrollerListEx<T extends object>(
  props: ScrollerListExProps<T>
) {
  // Selected item ref
  const selectedItem = React.useRef<[HTMLDivElement, T]>(null);

  const onMouseDown = (div: HTMLDivElement, data: T) => {
    // Destruct
    const [selectedDiv, selectedData] = selectedItem.current ?? [];

    if (selectedData != null && selectedData[idField] === data[idField]) return;

    selectedDiv?.classList.remove(selectedClassName);

    div.classList.add(selectedClassName);

    selectedItem.current = [div, data];

    if (onSelectChange) onSelectChange([data]);
  };

  const isSelected = (data?: T) => {
    const [_, selectedData] = selectedItem.current ?? [];
    const selected =
      selectedData && data && selectedData[idField] === data[idField]
        ? true
        : false;
    return selected;
  };

  // Destruct
  const {
    alternatingColors = [undefined, undefined],
    className,
    cacheKey,
    cacheMinutes = 15,
    idField = "id" as DataTypes.Keys<T>,
    itemSize,
    itemRenderer = ({ data, itemHeight, margins }) => (
      <Box
        component="pre"
        sx={{
          height: itemHeight,
          ...margins
        }}
      >
        {JSON.stringify(data)}
      </Box>
    ),
    onClick,
    onDoubleClick,
    onUpdateRows,
    onSelectChange,
    selectedColor = "#edf4fb",
    ...rest
  } = props;

  // Init handler
  const initHandler = useListCacheInitLoad<T>(cacheKey, cacheMinutes);

  // Theme
  const theme = useTheme();

  // Cache calculation
  const itemSizeResult = React.useMemo(():
    | [number, number, object]
    | undefined => {
    if (typeof itemSize === "function") return undefined;
    const [size, spaces, h] = itemSize;
    if (typeof spaces === "number")
      return [size, spaces, defaultMargin(MUGlobal.pagePaddings, undefined)];

    return [size, MUGlobal.getSpace(spaces, theme), defaultMargin(spaces, h)];
  }, [itemSize]);

  // Calculate size
  const calculateItemSize = (index: number): [number, number, object] => {
    // Callback function
    if (typeof itemSize === "function") {
      const result = itemSize(index);
      if (result.length == 2)
        return [...result, defaultMargin(MUGlobal.pagePaddings)];
      return result;
    }

    // Calculation
    return itemSizeResult!;
  };

  const onUpdateRowsHandler = React.useCallback(
    (rows: T[], state: GridLoaderStates<T>) => {
      GridUtils.getUpdateRowsHandler<T>(cacheKey)?.(rows, state);
      onUpdateRows?.(rows, state);
    },
    [onUpdateRows, cacheKey]
  );

  // Layout
  return (
    <ScrollerList<T>
      className={Utils.mergeClasses(
        "ScrollerListEx-Body",
        className,
        createGridStyle(alternatingColors, selectedColor)
      )}
      idField={idField}
      onRowsRendered={
        cacheKey
          ? (visibleRows) =>
              sessionStorage.setItem(
                `${cacheKey}-scroll`,
                JSON.stringify(visibleRows)
              )
          : undefined
      }
      onInitLoad={initHandler}
      onUpdateRows={onUpdateRowsHandler}
      rowComponent={({ index, items, style }) => {
        const data = items[index];
        const selected = isSelected(data);
        const rowClass = `ScrollerListEx-Row${index % 2}${
          selected ? ` ${selectedClassName}` : ""
        }`;

        const [itemHeight, space, margins] = calculateItemSize(index);

        // Child
        const child = itemRenderer({
          index,
          data,
          style,
          selected,
          itemHeight,
          space,
          margins
        });

        return (
          <div
            className={rowClass}
            style={style}
            onMouseDown={(event) => onMouseDown(event.currentTarget, data)}
            onClick={(event) => onClick && onClick(event, data)}
            onDoubleClick={(event) =>
              onDoubleClick && onDoubleClick(event, data)
            }
          >
            {child}
          </div>
        );
      }}
      rowHeight={(index) => {
        const [size, space] = calculateItemSize(index);
        return size + space;
      }}
      {...rest}
    />
  );
}
