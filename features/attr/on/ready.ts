import type { AttrFeature, Control, ControlDecl } from "@ahx/types";
import { getConfig } from "@ahx/custom/config.ts";
import { isParentNode } from "@ahx/common/guards.ts";
import { createControl } from "@ahx/core/control.ts";
import { normalizePipeline } from "@ahx/core/parse-pipeline.ts";
import * as log from "@ahx/custom/log/error.ts";
import { dispatchAhxEvent } from "@ahx/core/ahx-event.ts";

export default function (feature: AttrFeature): void {
  const { context, element, name, value } = feature;

  if (!value || !isParentNode(context)) return;

  const { onAttrPrefix } = getConfig(element, "onAttrPrefix");

  if (onAttrPrefix && name.startsWith(onAttrPrefix)) {
    element.removeAttribute(name);

    readyControl({
      root: context,
      source: element,
      eventType: name.slice(onAttrPrefix.length),
      pipelineStr: value,
      baseURL: element.baseURI,
    });
  }
}

export async function readyControl(decl: ControlDecl): Promise<void> {
  const pipelineStr = normalizePipeline(decl.pipelineStr);

  if (!pipelineStr) return;

  let control: Control;

  try {
    control = await createControl(decl);
  } catch (error: unknown) {
    log.error(`Invalid pipeline "${pipelineStr}"`, error);
    return;
  }

  if (control.eventTarget) {
    control.eventTarget.addEventListener(control.eventType, control, {
      passive: true,
      once: true,
    });

    dispatchAhxEvent("ready", control.eventTarget, {
      control,
      bubbles: false,
    });
  }
}
