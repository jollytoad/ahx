import type { AttrFeature } from "@ahx/types";
import { getConfig } from "@ahx/custom/config.ts";
import { updateControl } from "@ahx/core/update-control.ts";
import { isNode } from "@ahx/common/guards.ts";

export default function (feature: AttrFeature): void {
  if (!isParentNode(feature.context)) return;

  const { onAttrPrefix } = getConfig(feature.element, "onAttrPrefix");

  if (onAttrPrefix && feature.name.startsWith(onAttrPrefix)) {
    const eventType = feature.name.slice(onAttrPrefix.length);
    updateControl({
      root: feature.context,
      source: feature.element,
      eventType,
      pipelineStr: feature.value ?? "",
    });
  }
}

function isParentNode(node: unknown): node is ParentNode {
  return isNode(node) && "children" in node;
}
