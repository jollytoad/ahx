import { dispatchOneShot } from "./util/dispatch.ts";

export function triggerMutate(elt: Element) {
  dispatchOneShot(elt, "mutate", {});
}
