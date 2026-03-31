import type { ActionContext } from "@ahx/types";
import { isNode } from "./guards.ts";

/**
 * Get the base URL to resolve a relative URL against.
 *
 * @param context the current ActionContext
 */
export function getBaseURL(context: ActionContext): string | URL | undefined {
  const { baseURL, control, targets } = context;

  if (baseURL instanceof URL) return baseURL;

  function controlURL() {
    return control.root?.baseURI;
  }

  function targetURL() {
    return targets?.find(isNode)?.baseURI;
  }

  switch (baseURL) {
    case undefined:
    case "@control":
      return controlURL();
    case "@target":
      return targetURL();
    default:
      return baseURL;
  }
}
