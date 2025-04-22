import { Utils } from "@etsoo/shared";
import { HTMLAttributes } from "react";

class HtmlDivElement extends HTMLElement {
  static get observedAttributes() {
    return ["displaystyle"];
  }

  private wrapper: HTMLDivElement | null = null;
  private observer: MutationObserver | null = null;

  private _displayStyle?: string = undefined;

  /**
   * Display style
   */
  get displayStyle() {
    return this._displayStyle;
  }
  set displayStyle(style: string | undefined) {
    this._displayStyle = style;
    if (this.wrapper && style != null) {
      this.wrapper.style.cssText = style;
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });

    // Default styles
    // Comply with @etsoo/editor default styles
    const style = document.createElement("style");
    style.textContent = `
    :host {
      box-sizing: border-box;
    }
    img { 
      max-width: 100%;
    }
    pre {
      background-color: #f3f3f3;
      padding: 12px;
    }
    `;
    shadow.appendChild(style);

    // Create a wrapper element to hold the sanitized HTML content
    const wrapper = document.createElement("div");
    wrapper.style.cssText = this.displayStyle ?? "";
    shadow.appendChild(wrapper);

    this.wrapper = wrapper;
    this.setContent();

    let miliseconds = Date.now();
    this.observer = new MutationObserver(() => {
      const m = Date.now();
      if (m - miliseconds < 50) return; // Ignore fast changes
      miliseconds = m;
      this.setContent();
    });
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
    if (name === "displaystyle" && typeof newValue === "string") {
      this.displayStyle = newValue;
    }
  }

  setContent() {
    const wrapper = this.wrapper;
    if (!wrapper) return;

    const html = this.innerHTML;
    if (
      Utils.hasHtmlEntity(html) &&
      !Utils.hasHtmlTag(html) &&
      this.textContent
    ) {
      wrapper.innerHTML = this.textContent;
    } else {
      wrapper.innerHTML = html;
    }

    this.textContent = null; // Clear the textContent to avoid duplication
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
export type HtmlDivProps = HTMLAttributes<HTMLElement> & {
  /**
   * Display style
   * 显示样式
   */
  displayStyle?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "html-div": React.HTMLAttributes<HTMLElement>;
    }
  }
}

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
