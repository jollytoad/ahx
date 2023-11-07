import type { TriggerDetail } from "../types.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";

const actionQueue = new Set<TriggerDetail>();

export function enqueueAction(detail: TriggerDetail) {
  if (dispatchBefore(detail.source, "queue", detail)) {
    actionQueue.add(detail);
  }
}

export function dequeueAction(detail: TriggerDetail) {
  actionQueue.delete(detail);
  dispatchAfter(detail.source, "queue", detail);
}

export function queue(): Iterable<TriggerDetail> {
  return actionQueue.values();
}
