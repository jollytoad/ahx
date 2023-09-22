import type { CSSPropertyName } from "./types.ts";

interface ParseValueProps {
  rule?: CSSStyleRule;
  style?: CSSStyleDeclaration;
  prop: CSSPropertyName;
  elt?: Element;
}

interface CssValueSpec {
  value?: string;
  delim?: string;
  important?: boolean;
}

export function parseCssValue(
  { rule, style, prop, elt }: ParseValueProps,
): CssValueSpec {
  style ??= rule?.style ?? (elt && getComputedStyle(elt));

  const spec: CssValueSpec = {
    value: style?.getPropertyValue(prop)?.trim(),
    important: style?.getPropertyPriority(prop) === "important",
  };

  if (spec.value) {
    // match: --append(<delim?>) *
    const isAppend = /^--append\(([^\)]*)\)\s+(.+)$/.exec(spec.value);
    if (isAppend) {
      spec.delim = isAppend[1] ? parseQuoted(isAppend[1]) : " ";
      spec.value = isAppend[2];
    }

    // match: attr(<name> <type?>)
    if (elt) {
      const isAttr = /^attr\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(
        spec.value,
      );
      if (isAttr) {
        spec.value = elt.getAttribute(isAttr[1]) ?? undefined;
        if (spec.value && isAttr[2] === "url") {
          spec.value = new URL(spec.value, elt.baseURI).href;
        }
        return spec;
      } else {
        // match: --prop(<name> <type?>)
        const isProp = /^--prop\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(
          spec.value,
        );
        if (isProp) {
          spec.value = undefined;
          const propValue = elt[isProp[1] as keyof Element];
          if (isProp[2] === "url" && typeof propValue === "string") {
            spec.value = new URL(propValue, elt.baseURI).href;
          } else if (
            typeof propValue === "string" || typeof propValue === "number" ||
            typeof propValue === "boolean"
          ) {
            spec.value = String(propValue);
          }
          return spec;
        }
      }
    }

    // match: url(<url?>)
    const isURL = /^url\(([^\)]*)\)$/.exec(spec.value);
    if (isURL) {
      spec.value = isURL[1];
    }

    spec.value = parseQuoted(spec.value);

    if (isURL) {
      const styleSheet = rule?.parentStyleSheet ??
        style?.parentRule?.parentStyleSheet;
      spec.value = new URL(spec.value, styleSheet?.href ?? undefined).href;
    }
  }

  return spec;
}

function parseQuoted(value: string): string {
  // match: "<string?>" or '<string?>'
  const isQuoted = /^\"([^\"]*)\"$/.exec(value) ??
    /^\'([^\']*)\'$/.exec(value);
  if (isQuoted) {
    return isQuoted[1];
  }
  return value;
}
