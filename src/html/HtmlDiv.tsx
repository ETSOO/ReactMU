import DOMPurify from "dompurify";
import { HTMLAttributes } from "react";

class HtmlDivElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // Create a wrapper element to hold the sanitized HTML content
    const wrapper = document.createElement("div");
    if (this.textContent) {
      wrapper.innerHTML = DOMPurify.sanitize(this.textContent);
      this.textContent = null; // Clear the textContent to avoid duplication
    }

    shadow.appendChild(wrapper);
  }
}

// Define the custom element only once
if (!customElements.get("html-div")) {
  customElements.define("html-div", HtmlDivElement);
}

/**
 * Custom HTML element properties
 * 自定义 HTML 元素属性
 */
export type HtmlDivProps = HTMLAttributes<HTMLElement>;

/**
 * Custom HTML element that sanitizes and displays HTML content
 * 自定义 HTML 元素，用于清理和显示 HTML 内容
 * @param props Properties
 * @returns Component
 */
export function HtmlDiv(props: HtmlDivProps) {
  // Destruct
  const { children, ...rest } = props;

  // Layout
  return <html-div {...rest}>{children}</html-div>;
}
