
import { isElement, isNode } from "@ahx/common/guards.js";


export const template = (...args) => {
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }

  const selector = args.join(" ");

  return ({ control }) => {
    const template = control.root?.querySelector(selector);
    if (isTemplateElement(template)) {
      return { nodes: template.content.children, texts: undefined };
    }
    return { break: true };
  };
};

function isTemplateElement(node) {
  return isElement(node, "template") &&
    isNode(node.content, 11);
}
