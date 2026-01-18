
import { getConfig } from "@ahx/custom/config.js";
import { updateControl } from "@ahx/core/update-control.js";
import { isElement, isNode, isShadowRoot } from "@ahx/common/guards.js";

export default function (feature) {
  if (!isParentNode(feature.context)) return;

  const { onCssPropPrefix } = getConfig(
    feature.context,
    "onCssPropPrefix",
  );

  if (onCssPropPrefix && feature.name.startsWith(onCssPropPrefix)) {
    const eventType = feature.name.slice(onCssPropPrefix.length);
    const pipelineStr = feature.value;

    if (eventType && pipelineStr) {
      updateControl({
        root: feature.context,
        source: feature.rule,
        eventType,
        pipelineStr,
        ...selectorTextRule,
      });
    }
  }
}

function isParentNode(node) {
  return isNode(node) && "children" in node;
}

const selectorTextRule = {
  ruleNodes() {
    const { root, source } = this;
    if (root && hasSelectorText(source)) {
      switch (source.selectorText) {
        case ":root":
          return [root];
        case ":host":
          return isShadowRoot(root) ? [root.host] : [];
        default:
          return root.querySelectorAll(source.selectorText);
      }
    }
    return [];
  },
  ruleApplies(node) {
    const { root, source } = this;
    if (hasSelectorText(source)) {
      switch (source.selectorText) {
        case ":root":
          return node === root;
        case ":host":
          return isShadowRoot(root) && node === root.host;
        default:
          return isElement(node) && node.matches(source.selectorText);
      }
    }
    return false;
  },
};

function hasSelectorText(
  source,
) {
  return !!source && "selectorText" in source && !!source.selectorText;
}
