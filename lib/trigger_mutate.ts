import { dispatchOneShot } from "./dispatch.ts";

export function triggerMutate(elt: Element) {
  dispatchOneShot(elt, "mutate", {});
}
