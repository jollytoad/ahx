import type { ActionConstruct, ActionResult } from "@ahx/types";

/**
 * Select a node for a swap or other action
 */
export const sleep: ActionConstruct = (...args) => {
  const [durationStr = "0"] = args;
  const duration = parseInt(durationStr);

  return ({ signal }): Promise<ActionResult> => {
    if (signal?.aborted) return Promise.resolve({ break: true });

    return new Promise<ActionResult>((resolve) => {
      function abort() {
        clearTimeout(handle);
        resolve({ break: true });
      }

      function done() {
        signal?.removeEventListener("abort", abort);
        resolve({});
      }

      const handle = setTimeout(done, duration);
      signal?.addEventListener("abort", abort, { once: true });
    });
  };
};
