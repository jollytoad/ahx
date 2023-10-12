import { getInternal } from "./util/internal.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import type { AhxCSSPropertyName, CssImportDetail } from "./types.ts";
import { asAhxCSSPropertyName } from "./util/names.ts";
import { resolveElement } from "./util/resolve_element.ts";

export function processCssImports(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName>,
  onReady?: (link: HTMLLinkElement) => void,
) {
  const importProp = asAhxCSSPropertyName("import");

  for (const prop of props) {
    if (prop === importProp || prop.startsWith(`${importProp}-`)) {
      let link: HTMLLinkElement | undefined = getInternal(rule, "importLinks")
        ?.get(prop)?.deref();
      let ruleApplies = false;

      for (const elt of document.querySelectorAll(rule.selectorText)) {
        // TODO: consider getting computed style so that media queries are applied
        // and/or allow media-queries to be appended to the prop value, like `@import`

        const url = parseCssValue(prop, rule, elt).value;

        if (url) {
          ruleApplies = true;
          if (link) {
            if (link.sheet && link.sheet.disabled) {
              link.sheet.disabled = false;
              setTimeout(() => {
                onReady?.(link!);
              }, 0);
            }
            break;
          } else {
            link = createStyleSheetLink(
              url,
              (resolveElement(rule) as HTMLLinkElement)?.crossOrigin ??
                undefined,
              onReady,
            );

            if (link) {
              getInternal(rule, "importLinks", () => new Map()).set(
                prop,
                new WeakRef(link),
              );
              break;
            }
          }
        }
      }

      if (!ruleApplies && link && link.sheet && !link.sheet.disabled) {
        link.sheet.disabled = true;
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
        console.log("After load", detail.url, link.sheet);
        // IMPORTANT: The sheet object may not immediately appear in the DOM,
        // even after the load event, so we may need to poll until it actually
        // appears.
        function process(delay = 1) {
          setTimeout(() => {
            console.log("After load + timeout", detail.url, link.sheet);
            if (link.sheet) {
              dispatchAfter(event.target ?? document, "cssImport", detail);
              onReady?.(link);
            } else if (delay < 1000) {
              process(delay * 2);
            } else {
              console.error("TIMEOUT");
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
