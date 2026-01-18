
import { getControl, storeControl } from "@ahx/common/controls.js";
import * as log from "@ahx/custom/log/error.js";
import { dispatchAhxEvent } from "./ahx-event.js";
import { createControl } from "./control.js";
import { normalizePipeline } from "./parse-pipeline.js";

export async function updateControl(
  decl,
) {
  let newControl;
  const register = (control) => {
    newControl = control;
  };

  const controlPromise = doUpdateControl(decl, register);
  storeControl(decl.source, decl.eventType, controlPromise);

  await controlPromise;

  const ready = new Set();

  for (const node of newControl?.nodes() ?? []) {
    if (!ready.has(node)) {
      ready.add(node);
      setTimeout(() => {
        dispatchAhxEvent("ready", node, {
          control: newControl,
          composed: false,
        });
      });
    }
  }

  return ready;
}

async function doUpdateControl(
  decl,
  register,
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
    register(control);
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
