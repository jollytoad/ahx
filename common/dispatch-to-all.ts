import type { ActionResult } from "@ahx/types";

export function dispatchToAll<T extends EventTarget>(
  targets: T[] | undefined,
  createEvent: (target: T) => Event,
): ActionResult | void {
  if (!targets?.length) return;

  let shouldBreak = false;

  for (const target of targets) {
    const event = createEvent(target);

    if (target.dispatchEvent(event) === false) {
      shouldBreak = true;
    }
  }

  return shouldBreak ? { break: true } : undefined;
}
