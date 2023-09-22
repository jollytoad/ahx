import { config } from "./config.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { CssImportDetail, CSSPropertyName } from "./types.ts";

const importLinks = new WeakMap<
  CSSStyleRule,
  Map<CSSPropertyName, HTMLLinkElement>
>();

type Outcome = false | "created" | "enabled" | "disabled";

export function processCssImports(
  rule: CSSStyleRule,
  props: Set<CSSPropertyName>,
): Outcome {
  let imported: Outcome = false;

  const importProp = `--${config.prefix}-import`;

  for (const prop of props) {
    if (prop === importProp || prop.startsWith(`${importProp}-`)) {
      if (!importLinks.has(rule)) {
        importLinks.set(rule, new Map());
      }

      let link: HTMLLinkElement | undefined = importLinks.get(rule)?.get(prop);
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
              imported = "enabled";
            }
            break;
          } else {
            link = createStyleSheetLink(
              url,
              (rule.parentStyleSheet?.ownerNode as HTMLLinkElement)
                ?.crossOrigin ?? undefined,
            );

            if (link) {
              importLinks.get(rule)?.set(prop, link);
              imported = "created";
              break;
            }
          }
        }
      }

      if (!ruleApplies && link && link.sheet && !link.sheet.disabled) {
        link.sheet.disabled = true;
        imported = "disabled";
      }
    }
  }
  return imported;
}

function createStyleSheetLink(
  url: string,
  crossOrigin?: string,
): HTMLLinkElement | undefined {
  const detail: CssImportDetail = { url, crossOrigin, disabled: false };

  if (triggerBeforeEvent(document, "cssImport", detail)) {
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
        triggerAfterEvent(event.target ?? document, "cssImport", detail);
      }, { once: true, passive: true });

      document.head.appendChild(link);
      return link;
    }
  }
}
