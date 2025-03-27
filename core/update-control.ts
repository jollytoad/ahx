import type { Control, ControlDecl } from "@ahx/types";
import { getControl, storeControl } from "@ahx/common/controls.ts";
import * as log from "@ahx/common/logging.ts";
import { dispatchAhxEvent } from "./ahx-event.ts";
import { createControl } from "./control.ts";
import { normalizePipeline } from "./parse-pipeline.ts";

export async function updateControl(
  decl: ControlDecl,
): Promise<Set<Node>> {
  let newControl: Control | undefined;
  const register = (control: Control) => {
    newControl = control;
  };

  const controlPromise = doUpdateControl(decl, register);
  storeControl(decl.source, decl.eventType, controlPromise);

  await controlPromise;

  const ready = new Set<Node>();

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
  decl: ControlDecl,
  register: (control: Control) => void,
): Promise<Control | undefined> {
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
  } catch (error: unknown) {
    log.error(`Invalid pipeline "${pipelineStr}"`, error);
    return;
  }

  if (control.eventTarget) {
    control.eventTarget.addEventListener(eventType, control);
    dispatchAhxEvent("setup", control.eventTarget, { control });
  }

  return control;
}
