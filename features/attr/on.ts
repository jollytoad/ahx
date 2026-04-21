import type { AttrFeature } from "@ahx/types";
import { getConfig } from "@ahx/custom/config.ts";
import { updateControl } from "@ahx/core/update-control.ts";
import { isParentNode } from "@ahx/common/guards.ts";

export default async function (feature: AttrFeature): Promise<void> {
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
