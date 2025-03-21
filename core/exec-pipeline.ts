import type { ActionContext, ActionResult } from "@ahx/types";
import { dispatchActionEvent } from "./action-event.ts";
import * as log from "@ahx/common/logging.ts";
import { getConfig } from "@ahx/common/config.ts";

export async function execPipeline(
  context: ActionContext,
): Promise<ActionResult | void> {
  const root = context?.control.root;
  if (!root) return Promise.resolve(context);

  const { eventPrefix } = getConfig(root, "eventPrefix");

  log.beforePipeline(context);

  const { trace, control, event } = context;

  let { index } = context;
  let result!: ActionResult | void;

  while (control.actions[index]) {
    const signal = control.signal;
    signal.throwIfAborted();

    const action = control.actions[index]!;
    const immutable = { trace, control, event, action, index, signal };

    context = { ...context, ...immutable };
    log.beforeAction(context);

    // *** Dispatch before action event ***

    const before = await dispatchActionEvent(
      "before",
      context,
      root,
      eventPrefix,
    );

    signal.throwIfAborted();

    if (before?.break) {
      log.cancelAction(context);
      break;
    }
    if (before) {
      context = { ...context, ...before, ...immutable };
      log.beforeAction(context);
    }

    // *** Perform the Action ***

    result = await action.fn(context);

    context = { ...context, ...result, ...immutable };
    log.afterAction(context, result);

    signal.throwIfAborted();

    if (result?.break) {
      log.cancelAction(context);
      break;
    }

    // *** Dispatch after action event ***

    const after = await dispatchActionEvent(
      "after",
      context,
      root,
      eventPrefix,
    );

    signal.throwIfAborted();

    if (after?.break) {
      log.cancelAction(context);
      break;
    }

    if (after) {
      result = { ...result, ...after };
      context = { ...context, ...result, ...immutable };
      log.afterAction(context, result);
    }

    index++;
  }

  log.afterPipeline(context, result);

  if (result?.break) {
    result = { ...result };
    delete result.break;
  }

  return result;
}
