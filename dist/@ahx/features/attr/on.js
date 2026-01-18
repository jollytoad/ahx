
import { getConfig } from "@ahx/custom/config.js";
import { updateControl } from "@ahx/core/update-control.js";
import { isNode } from "@ahx/common/guards.js";

export default function (feature) {
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

function isParentNode(node) {
  return isNode(node) && "children" in node;
}
