import type { ActionConstruct, ActionResult } from "@ahx/types";

// TODO: selecting the content of a template could be a feature of the extended selector

/**
 * Select the content of a template for a swap or other action
 */
export const template: ActionConstruct = (...args) => {
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }

  const selector = args.join(" ");

  return ({ control }): ActionResult => {
    const template = control.root?.querySelector(selector);
    if (template instanceof HTMLTemplateElement) {
      return { nodes: template.content.children, texts: undefined };
    }
    return { break: true };
  };
};
