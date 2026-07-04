/**
 * Utility functions for canvas operations
 */
export namespace CanvasUtils {
  /**
   * JPEG content type
   */
  export const JPG = "image/jpeg";

  /**
   * PNG content type
   */
  export const PNG = "image/png";

  /**
   * WEBP content type
   */
  export const WEBP = "image/webp";

  /**
   * SVG content type
   */
  export const SVG = "image/svg+xml";

  /**
   * Convert canvas to Blob
   * @param canvas Canvas element
   * @param type MIME type of the image
   * @param quality Image quality (0 to 1)
   * @returns Promise that resolves to a Blob
   */
  export function toBlob(
    canvas: HTMLCanvasElement,
    type = "image/png",
    quality = 1
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create Blob."));
          }
        },
        type,
        quality
      );
    });
  }

  /**
   * Trim the canvas to remove empty space around the signature
   * @param canvas Canvas element
   * @returns Trimmed canvas
   */
  export function trim(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d")!;
    const { width, height } = canvas;

    const { data } = ctx.getImageData(0, 0, width, height);

    let top = height;
    let left = width;
    let right = 0;
    let bottom = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] === 0) continue;

        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }

    const trimmed = document.createElement("canvas");

    // Empty canvas
    if (right < left || bottom < top) return trimmed;

    trimmed.width = right - left + 1;
    trimmed.height = bottom - top + 1;

    trimmed
      .getContext("2d")!
      .drawImage(
        canvas,
        left,
        top,
        trimmed.width,
        trimmed.height,
        0,
        0,
        trimmed.width,
        trimmed.height
      );

    return trimmed;
  }
}
