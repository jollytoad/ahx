
import { getControl, storeControl } from "@ahx/common/controls.js";
import * as log from "@ahx/custom/log/error.js";
import { dispatchAhxEvent } from "./ahx-event.js";
import { createControl } from "./control.js";
import { normalizePipeline } from "./parse-pipeline.js";

export function updateControl(
  decl,
) {
  const controlPromise = doUpdateControl(decl);
  return storeControl(decl.source, decl.eventType, controlPromise);
}

async function doUpdateControl(
  decl,
) {
  const { source, eventType } = decl;
  const pipelineStr = normalizePipeline(decl.pipelineStr);

  let control = await getControl(source, eventType);

  if (control) {
    const isDead = control.isDead();
    const isChange = control.toString() !== pipelineStr;

    if (isDead || isChange) {
      if (control.eventTarget) {
        control.eventTarget.removeEventListener(eventType, control);
        dispatchAhxEvent("teardown", control.eventTarget, { control });
      }
    }

    if (isDead) return;
    if (!isChange) return control;
  }

  if (!pipelineStr) return;

  try {
    control = await createControl(decl);
  } catch (error) {
    log.error(`Invalid pipeline "${pipelineStr}"`, error);
    return;
  }

  if (control.eventTarget) {
    control.eventTarget.addEventListener(eventType, control);
    dispatchAhxEvent("setup", control.eventTarget, { control });
  }

  return control;
}
