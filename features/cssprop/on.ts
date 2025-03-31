import type { Control, ControlSource, CSSPropertyFeature } from "@ahx/types";
import { getConfig } from "@ahx/custom/config.ts";
import { updateControl } from "@ahx/core/update-control.ts";

export default function (feature: CSSPropertyFeature): void {
  if (!isParentNode(feature.context)) return;

  const { onCssPropPrefix } = getConfig(
    feature.context,
    "onCssPropPrefix",
  );

  if (onCssPropPrefix && feature.name.startsWith(onCssPropPrefix!)) {
    const eventType = feature.name.slice(onCssPropPrefix!.length);
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

function isParentNode(node: unknown): node is ParentNode {
  return node instanceof Node && "children" in node;
}

const selectorTextRule = {
  ruleNodes(this: Control): Iterable<Node> {
    const { root, source } = this;
    if (root && hasSelectorText(source)) {
      switch (source.selectorText) {
        case ":root":
          return [root];
        case ":host":
          return root instanceof ShadowRoot ? [root.host] : [];
        default:
          return root.querySelectorAll(source.selectorText);
      }
    }
    return [];
  },
  ruleApplies(this: Control, node: Node): boolean {
    const { root, source } = this;
    if (hasSelectorText(source)) {
      switch (source.selectorText) {
        case ":root":
          return node === root;
        case ":host":
          return root instanceof ShadowRoot && node === root.host;
        default:
          return node instanceof Element && node.matches(source.selectorText);
      }
    }
    return false;
  },
};

function hasSelectorText(
  source?: ControlSource,
): source is { selectorText: string } {
  return !!source && "selectorText" in source && !!source.selectorText;
}
