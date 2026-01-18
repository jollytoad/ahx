
import { dispatchActionEvent } from "./action-event.js";
import * as log from "@ahx/custom/log/pipeline.js";
import { getConfig } from "@ahx/custom/config.js";
import { initFeatures } from "./init-features.js";

export async function execPipeline(
  context,
) {
  const root = context?.control.root;
  if (!root) return Promise.resolve(context);

  const { eventPrefix } = getConfig(root, "eventPrefix");

  log.beforePipeline(context);

  const { trace, control, event } = context;

  let { index } = context;
  let result;

  while (control.actions[index]) {
    const signal = control.signal;
    signal.throwIfAborted();

    const action = control.actions[index];
    const immutable = { trace, control, event, action, index, signal };

    context = { ...context, ...immutable };
    log.beforeAction(context);

    
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

        result = await action.fn(context);

    context = { ...context, ...result, ...immutable };
    log.afterAction(context, result);

    signal.throwIfAborted();

    if (result?.break) {
      log.cancelAction(context);
      break;
    }

    
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

    if (result?.init) {
      await initFeatures(control.root, result.init);
      delete context.init;
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
