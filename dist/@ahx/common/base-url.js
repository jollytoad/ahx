
import { isNode } from "./guards.js";

export function getBaseURL(context) {
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
