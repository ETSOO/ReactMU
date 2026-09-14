import Icon from "@mui/material/Icon";
import CssFilterConverter from "css-filter-converter";

/**
 * SVG utility functions
 */
export namespace SVGUtils {
  /**
   * Create an SVG icon component
   * @param icon Icon
   * @param filterColor Filter color for the icon
   * @returns Component
   */
  // https://cdn.jsdelivr.net/npm/@material-design-icons/svg@latest/filled/local_mall.svg
  export function createIcon(
    icon?: string | null,
    filterColor?: string | null
  ) {
    if (!icon) return undefined;

    if (icon.startsWith("/")) icon = "https://localhost:9002/" + icon;
    else if (icon.startsWith("<path "))
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${icon}</svg>`;

    if (icon.startsWith("<svg "))
      icon = `data:image/svg+xml;utf8,${encodeURIComponent(icon)}`;

    const filter = !filterColor ? undefined : hexToCssFilter(filterColor);

    return (
      <Icon sx={{ display: "flex", height: "inherit", width: "inherit" }}>
        <img src={icon} style={{ filter }} />
      </Icon>
    );
  }

  /**
   * Hex color to CSS filter
   * @param hex Hex color
   * @returns Result
   */
  export function hexToCssFilter(hex: string): string {
    const result = CssFilterConverter.hexToFilter(hex);
    if (result == null || result.color == null)
      throw result.error ?? new Error(`Invalid hex color: ${hex}`);
    return result.color;
  }

  /**
   * CSS filter to hex color
   * @param filter CSS filter
   * @returns Result
   */
  export async function cssFilterToHex(filter: string): Promise<string> {
    const result = await CssFilterConverter.filterToHex(filter);
    if (result == null || result.color == null)
      throw result.error ?? new Error(`Invalid CSS filter: ${filter}`);
    return result.color;
  }
}
