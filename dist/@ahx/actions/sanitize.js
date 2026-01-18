
import { isNode } from "@ahx/common/guards.js";

const validOps = new Set(["fragment", "node", "html"]);
const defaultOp = "fragment";

export const sanitize = async (...args) => {
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

  return async ({ response }) => {
    if (!response?.body) return;

    const content = await response.text();

    const sanitized = DOMPurify.sanitize(content);

    if (isNode(sanitized)) {
      return { nodes: [sanitized], texts: undefined };
    } else if (typeof sanitized === "string") {
      return { nodes: undefined, texts: [sanitized] };
    } else {
      return { nodes: undefined, texts: undefined };
    }
  };
};

async function importDOMPurify() {
  if ("DOMPurify" in window) {
    return window.DOMPurify;
  } else {
    return (await import("dompurify")).default;
  }
}
