import { css } from "@emotion/css";
import {
  GridLoaderStates,
  ScrollerList,
  ScrollerListProps
} from "@etsoo/react";
import { DataTypes, Utils } from "@etsoo/shared";
import React from "react";
import { MouseEventWithDataHandler, MUGlobal } from "./MUGlobal";
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

// Default margins
const defaultMargins = () => {
  const half = MUGlobal.half(MUGlobal.pagePaddings);

  return {
    marginLeft: 0,
    marginRight: 0,
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
   * Default margins
   */
  margins: object;

  /**
   * Item selected
   */
  selected: boolean;
};

/**
 * Extended ScrollerList Props
 */
export type ScrollerListExProps<T extends object> = Omit<
  ScrollerListProps<T>,
  "rowComponent" | "rowHeight" | "onClick" | "onDoubleClick" | "onInitLoad"
> &
  Partial<Pick<ScrollerListProps<T>, "rowHeight">> & {
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
     * Cell margins, default to half of MUGlobal.pagePaddings
     */
    cellMargins?: object;

    /**
     * Item renderer
     */
    itemRenderer?: (
      props: ScrollerListExItemRendererProps<T>
    ) => React.ReactNode;

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
    cellMargins = defaultMargins(),
    idField = "id" as DataTypes.Keys<T>,
    itemRenderer = ({ data, margins }) => (
      <Box
        component="pre"
        sx={{
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
    rowHeight = 116,
    selectedColor = "#edf4fb",
    ...rest
  } = props;

  // Init handler
  const initHandler = useListCacheInitLoad<T>(cacheKey, cacheMinutes);

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
      rowComponent={(cellProps) => {
        const { index, style, items } = cellProps;
        const data = items[index];
        const selected = isSelected(data);
        const rowClass = `ScrollerListEx-Row${index % 2}${
          selected ? ` ${selectedClassName}` : ""
        }`;

        // Child
        const child = itemRenderer({
          index,
          data,
          style,
          selected,
          margins: cellMargins
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
      rowHeight={rowHeight}
      {...rest}
    />
  );
}
