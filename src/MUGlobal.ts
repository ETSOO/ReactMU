import { NumberUtils } from "@etsoo/shared";
import { Breakpoint, ListItemButtonProps, Theme } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Mouse event handler with data
 */
export type MouseEventWithDataHandler<T> = (
  event: React.MouseEvent<HTMLDivElement>,
  data: T
) => void;

/**
 * MUGlobal for global configurations
 */
export class MUGlobal {
  /**
   * Search field shrink
   */
  static searchFieldShrink: boolean = true;

  /**
   * Search field size
   */
  static searchFieldSize: "small" | "medium" = "small";

  /**
   * Search field variant
   */
  static searchFieldVariant: "standard" | "filled" | "outlined" = "outlined";

  /**
   * Input field shrink
   */
  static inputFieldShrink: boolean = true;

  /**
   * Input field size
   */
  static inputFieldSize: "small" | "medium" = "medium";

  /**
   * Input field variant
   */
  static inputFieldVariant: "standard" | "filled" | "outlined" = "outlined";

  /**
   * TextField variant
   */
  static textFieldVariant: "standard" | "filled" | "outlined" = "filled";

  /**
   * Page default paddings
   */
  static pagePaddings = { xs: 2, sm: 3 };

  /**
   * Get menu item props
   * @param path Current path
   * @param href Item's href
   * @returns Props
   */
  static getMenuItem(path: string, href: string) {
    let selected = false;

    if (path === href) {
      // Exact match, most common case
      selected = true;
    } else if (href.endsWith("*")) {
      href = href.slice(0, -1);
      selected = path.startsWith(href);
    } else if (href.endsWith("/all")) {
      selected = path.startsWith(href.slice(0, -3));
    }

    return {
      component: Link,
      selected,
      to: href,
      sx: {
        ...(selected && {
          ".MuiListItemIcon-root": {
            color: (theme) => theme.palette.primary.main
          }
        })
      }
    } as ListItemButtonProps;
  }

  /**
   * Update object number properties with half of it
   * @param input Input object
   * @returns Updated object
   */
  static half(input: object) {
    const newObj = { ...input };
    Object.entries(newObj).forEach(([key, value]) => {
      if (typeof value === "number") {
        Reflect.set(newObj, key, value / 2.0);
      }
    });
    return newObj;
  }

  /**
   * Reverse object number properties, like 5 to -5
   * @param input Input object
   * @returns Updated object
   */
  static reverse(input: object) {
    const newObj = { ...input };
    Object.entries(newObj).forEach(([key, value]) => {
      if (typeof value === "number") {
        Reflect.set(newObj, key, -value);
      }
    });
    return newObj;
  }

  /**
   * Update object number properties with adjustment
   * @param input Input object
   * @param adjust Adjust value or new size object
   * @param field Specific field
   * @returns Updated object
   */
  static increase(input: object, adjust: number | object, field?: string) {
    const newObj = { ...input };
    Object.entries(newObj).forEach(([key, value]) => {
      if (typeof value === "number") {
        if (field == null || field === key) {
          const adjustValue =
            typeof adjust === "number" ? adjust : Reflect.get(adjust, key);
          if (adjustValue == null || typeof adjustValue !== "number") return;

          Reflect.set(newObj, key, value + adjustValue);
        }
      }
    });
    return newObj;
  }

  /**
   * Adjust size with theme update
   * @param size Base size
   * @param adjust Adjustment
   * @param updateFunc Theme update function
   * @returns Updated object
   */
  static adjustWithTheme(
    size: number,
    adjust: object,
    updateFunc: (value: number) => string
  ) {
    const newObj = { ...adjust };
    Object.entries(newObj).forEach(([key, value]) => {
      if (typeof value === "number") {
        const newValue = NumberUtils.parseWithUnit(updateFunc(value));
        if (newValue != null) {
          Reflect.set(newObj, key, `${size - newValue[0]}${newValue[1]}`);
        }
      }
    });
    return newObj;
  }

  /**
   * Break points defined
   */
  static breakpoints = ["xs", "sm", "md", "lg", "xl"] as const;

  /**
   * Get multple medias theme space
   * Responsive values and Breakpoints as an object
   * xs = theme.breakpoints.up('xs')
   * https://mui.com/system/basics/
   * @param spaces Spaces
   * @param theme Theme
   * @returns Result
   */
  static getSpace(spaces: object, theme: Theme) {
    const start = this.breakpoints.length - 1;
    for (let i = start; i >= 0; i--) {
      const key = this.breakpoints[i];
      const value = Reflect.get(spaces, key);
      if (typeof value === "number") {
        const mediaRaw = theme.breakpoints.up(key as Breakpoint);
        const mediaQuery = mediaRaw.substring(mediaRaw.indexOf("("));
        if (window.matchMedia(mediaQuery).matches) {
          return parseInt(theme.spacing(value), 10);
        }
      }
    }

    return 0;
  }

  /**
   * Update object number properties with theme
   * @param input Input object
   * @param updateFunc Theme update function
   * @returns Updated object
   */
  static updateWithTheme(input: {}, updateFunc: (value: number) => string) {
    const newObj = { ...input };
    Object.entries(newObj).forEach(([key, value]) => {
      if (typeof value === "number") {
        Reflect.set(newObj, key, updateFunc(value));
      }
    });
    return newObj;
  }
}
