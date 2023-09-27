import type { AhxHttpMethod, AhxName, Prefix, SwapStyle } from "./types.ts";

interface Config {
  prefix: Prefix;
  httpMethods: AhxHttpMethod[];
  ahxAttrs: AhxName[];
  maxLoopCount: number;
  defaultDelay: number;
  defaultSettleDelay: number;
  defaultSwapDelay: number;
  defaultSwapStyle: SwapStyle;
  enableAhxCombinedEvent: boolean;
  pseudoChildTags: Record<string, string | null | undefined>;
}

export const config: Config = {
  prefix: "ahx",

  httpMethods: [
    "get",
    "post",
    "put",
    "patch",
    "delete",
  ],

  ahxAttrs: [
    "trigger",
  ],

  maxLoopCount: 10,

  defaultDelay: 20,
  defaultSettleDelay: 20,
  defaultSwapDelay: 0,
  defaultSwapStyle: "outerhtml",

  enableAhxCombinedEvent: false,

  // parent tag -> default child pseudo tag (or null if a child is not permitted)
  pseudoChildTags: {
    "article": "div",
    "aside": "div",
    "audio": "track",
    "body": "div",
    "canvas": null,
    "colgroup": "col",
    "datalist": "option",
    "dl": "dt",
    "footer": "div",
    "form": "fieldset",
    "head": null,
    "header": "div",
    "hgroup": "div",
    "html": null,
    "iframe": null,
    "main": "div",
    "map": "area",
    "menu": "li",
    "noscript": null,
    "object": null,
    "ol": "li",
    "optgroup": "option",
    "picture": "source",
    "portal": null,
    "pre": null,
    "script": null,
    "section": "div",
    "select": "option",
    "style": null,
    "table": "tbody",
    "tbody": "tr",
    "template": null,
    "textarea": null,
    "tfoot": "tr",
    "thead": "tr",
    "tr": "td",
    "ul": "li",
    "video": "track",

    // void elements
    "area": null,
    "base": null,
    "br": null,
    "col": null,
    "embed": null,
    "hr": null,
    "img": null,
    "input": null,
    "link": null,
    "meta": null,
    "param": null,
    "source": null,
    "track": null,
    "wbr": null,

    // default for all other parents
    "*": "span",
  },
};
