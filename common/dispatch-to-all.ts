import type { ActionResult } from "@ahx/types";

/**
 * Dispatch an event to all given targets
 *
 * @param targets the set of targets
 * @param createEvent a function to create a unique event for each target
 * @returns a `break` indicator if any dispatch returns false, otherwise nothing
 */
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
