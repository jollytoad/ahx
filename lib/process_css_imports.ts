import { getInternal } from "./internal.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { CssImportDetail, CSSPropertyName } from "./types.ts";
import { asAhxCSSPropertyName } from "./names.ts";

export function processCssImports(
  rule: CSSStyleRule,
  props: Set<CSSPropertyName>,
  onReady?: () => void,
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

        const url = parseCssValue({ rule, prop, elt }).value;

        if (url) {
          ruleApplies = true;
          if (link) {
            if (link.sheet && link.sheet.disabled) {
              link.sheet.disabled = false;
              setTimeout(() => {
                onReady?.();
              }, 0);
            }
            break;
          } else {
            link = createStyleSheetLink(
              url,
              (rule.parentStyleSheet?.ownerNode as HTMLLinkElement)
                ?.crossOrigin ?? undefined,
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
  onReady?: () => void,
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
        // IMPORTANT: setTimeout is required to ensure the stylesheet has
        // is exposed in the DOM before we trigger the done event.
        setTimeout(() => {
          dispatchAfter(event.target ?? document, "cssImport", detail);
          onReady?.();
        }, 0);
      }, { once: true, passive: true });

      document.head.appendChild(link);
      return link;
    }
  }
}
