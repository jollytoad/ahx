import { dispatchOneShot } from "./dispatch.ts";

export function triggerLoad(elt: Element) {
  dispatchOneShot(elt, "load", { recursive: true });
}
