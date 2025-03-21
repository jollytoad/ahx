import type { ActionConstruct, ActionResult } from "@ahx/types";
import { extendedSelectorAll } from "@ahx/common/extended-selector.ts";

/**
 * Select a node for a swap or other action
 */
export const select: ActionConstruct = (...args) => {
  validateSelector(...args);

  return (context): ActionResult => {
    const nodes = extendedSelectorAll(context, ...args);
    return nodes ? { nodes, texts: undefined } : { break: true };
  };
};

/**
 * Select the content of a template for a swap or other action
 */
export const template: ActionConstruct = (...args) => {
  validateSelector(...args);
  const selector = args.join(" ");

  return ({ control }): ActionResult => {
    const template = control.root?.querySelector(selector);
    if (template instanceof HTMLTemplateElement) {
      return { nodes: template.content.children, texts: undefined };
    }
    return { break: true };
  };
};

/**
 * Select a node as the target for a swap or other action
 */
export const target: ActionConstruct = (...args) => {
  validateSelector(...args);

  return (context): ActionResult => {
    const targets = extendedSelectorAll(context, ...args);
    return (targets.length) ? { targets: [...targets] } : { break: true };
  };
};

/**
 * Filter the targets that match the given selector,
 * and only continue the pipeline if at least one matches.
 */
export const matches: ActionConstruct = (...args) => {
  validateSelector(...args);
  const selector = args.join(" ");

  return ({ targets }): ActionResult | undefined => {
    const filtered = targets?.filter((target) =>
      target instanceof Element && target.matches(selector)
    );
    return filtered?.length ? { targets: filtered } : { break: true };
  };
};

function validateSelector(...args: string[]) {
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }
}
