"use client";

import { useEffect } from "react";

const selector = "button, a, [role='button'], input[type='search'], input[type='file']";

export function GlobalTooltips() {
  useEffect(() => {
    const enhance = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (element.dataset.tooltip || element.closest(".driver-popover") || element.hasAttribute("data-no-tooltip")) return;
        const label = element.getAttribute("aria-label") || element.getAttribute("title");
        const visibleText = element.textContent?.replace(/\s+/g, " ").trim();
        const tooltip = label || (visibleText && visibleText.length <= 38 ? visibleText : "");
        if (tooltip) {
          element.dataset.tooltip = tooltip;
          element.removeAttribute("title");
        }
      });
    };
    enhance(document);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches(selector)) enhance(node.parentElement || document);
          else enhance(node);
        }
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
