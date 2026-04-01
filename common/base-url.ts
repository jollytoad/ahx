import type { ActionContext } from "@ahx/types";
import { isNode } from "./guards.ts";

/**
 * Get the base URL to resolve a relative URL against.
 *
 * @param context the current ActionContext
 */
export function getBaseURL(context: ActionContext): string | URL | undefined {
  const { baseURL, control, targets, initialTarget } = context;

  if (baseURL instanceof URL) return baseURL;

  switch (baseURL) {
    case undefined:
    case "@control":
      return control.baseURL;
    case "@root":
      return control.root?.baseURI;
    case "@target":
      return targets?.find(isNode)?.baseURI;
    case "@this":
      return isNode(initialTarget) ? initialTarget.baseURI : undefined;
    default:
      return baseURL;
  }
}
