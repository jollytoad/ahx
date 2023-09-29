import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { swap } from "./swap.ts";
import type { AhxTriggered } from "./types.ts";

export async function handleAction(triggered: AhxTriggered) {
  const { target, action, owner } = triggered;

  if (dispatchBefore(target, "handleAction", triggered)) {
    switch (action.type) {
      case "request": {
        const response = await fetch(action.url, {
          method: action.method,
        });

        await swap(target, response, owner);
      }
    }

    dispatchAfter(target, "handleAction", triggered);
  }
}
