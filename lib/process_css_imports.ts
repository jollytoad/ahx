import { getInternal } from "./util/internal.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import type { CssImportDetail } from "./types.ts";
import { resolveElement } from "./util/resolve_element.ts";

export function processCssImports(
  rule: CSSStyleRule,
  onReady?: (link: HTMLLinkElement) => void,
) {
  const ruleApplies = !!resolveElement(rule)?.ownerDocument?.querySelector(
    rule.selectorText,
  );

  const urls = parseCssValue("import", rule);

  for (const url of urls) {
    let link = getInternal(rule, "importLinks")?.get(url)?.deref();

    if (link) {
      if (ruleApplies && link.sheet?.disabled) {
        // Enable a disabled stylesheet if the rule now applies
        link.sheet.disabled = false;
        setTimeout(() => {
          onReady?.(link!);
        }, 0);
      } else if (!ruleApplies && link.sheet) {
        // Disable an existing stylesheet if the rule no longer applies
        link.sheet.disabled = true;
      }
    } else if (ruleApplies) {
      link = createStyleSheetLink(
        url,
        (resolveElement(rule) as HTMLLinkElement)?.crossOrigin ??
          undefined,
        onReady,
      );

      if (link) {
        getInternal(rule, "importLinks", () => new Map()).set(
          url,
          new WeakRef(link),
        );
      }
    }
  }
}

function createStyleSheetLink(
  url: string,
  crossOrigin?: string,
  onReady?: (link: HTMLLinkElement) => void,
): HTMLLinkElement | undefined {
  const detail: CssImportDetail = { url, crossOrigin, disabled: false };

  if (dispatchBefore(document, "cssImport", detail)) {
    if (
      !document.querySelector(`link[rel="stylesheet"][href="${detail.url}"]`)
    ) {
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", detail.url);

      if (typeof detail.crossOrigin === "string") {
        link.setAttribute("crossorigin", detail.crossOrigin);
      }

      link.addEventListener("load", (event) => {
        // IMPORTANT: The sheet object may not immediately appear in the DOM,
        // even after the load event, so we may need to poll until it actually
        // appears.
        function process(delay = 1) {
          setTimeout(() => {
            if (link.sheet) {
              dispatchAfter(event.target ?? document, "cssImport", detail);
              onReady?.(link);
            } else if (delay < 1000) {
              process(delay * 2);
            } else {
              console.error(
                "ahx timeout loading stylesheet:",
                detail.url,
                link.sheet,
              );
            }
          }, delay);
        }

        process();
      }, { once: true, passive: true });

      document.head.appendChild(link);
      return link;
    }
  }
}
