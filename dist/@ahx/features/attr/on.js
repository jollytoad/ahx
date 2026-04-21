
import { getConfig } from "@ahx/custom/config.js";
import { updateControl } from "@ahx/core/update-control.js";
import { isParentNode } from "@ahx/common/guards.js";

export default async function (feature) {
  if (!isParentNode(feature.context)) return;

  const { onAttrPrefix } = getConfig(feature.element, "onAttrPrefix");

  if (onAttrPrefix && feature.name.startsWith(onAttrPrefix)) {
    const eventType = feature.name.slice(onAttrPrefix.length);
    await updateControl({
      root: feature.context,
      source: feature.element,
      eventType,
      pipelineStr: feature.value ?? "",
      baseURL: feature.element.baseURI,
    });
  }
}
