
import { isNode } from "./guards.js";

export function getBaseURL(context) {
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
