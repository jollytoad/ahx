// deno-lint-ignore-file no-window
import type { ActionConstruct, ActionResult } from "@ahx/types";
import type { DOMPurify } from "dompurify";

export type SanitizeOp = "fragment" | "node" | "html";

const validOps = new Set(["fragment", "node", "html"]);
const defaultOp: SanitizeOp = "fragment";

export const sanitize: ActionConstruct = async (...args) => {
  const [op = defaultOp] = args;

  if (!validOps.has(op)) {
    throw new TypeError(
      `Invalid sanitize mode: "${op}", may be one of: ${
        [...validOps].join(", ")
      } (default: "${defaultOp}")`,
    );
  }

  const DOMPurify = (await importDOMPurify())(window);

  DOMPurify.setConfig({
    ADD_TAGS: ["iframe"],
    RETURN_DOM: op === "node",
    RETURN_DOM_FRAGMENT: op === "frag",
  });

  DOMPurify.addHook(
    "uponSanitizeAttribute",
    function (_currentNode, hookEvent, _config) {
      if (hookEvent.attrName.startsWith("on-")) {
        hookEvent.forceKeepAttr = true;
      }
    },
  );

  return async ({ response }): Promise<ActionResult | undefined> => {
    if (!response?.body) return;

    const content = await response.text();

    const sanitized: unknown = DOMPurify.sanitize(content);

    if (sanitized instanceof Node) {
      return { nodes: [sanitized], texts: undefined };
    } else if (typeof sanitized === "string") {
      return { nodes: undefined, texts: [sanitized] };
    } else {
      return { nodes: undefined, texts: undefined };
    }
  };
};

async function importDOMPurify(): Promise<DOMPurify> {
  if ("DOMPurify" in window) {
    return window.DOMPurify as DOMPurify;
  } else {
    return (await import("dompurify")).default;
  }
}
