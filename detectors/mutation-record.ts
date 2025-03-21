import type { AttrFeature, Context, RecurseFeature } from "@ahx/types";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";

export function* mutationRecordDetector(
  node: unknown,
  context?: Context,
): Iterable<RecurseFeature | AttrFeature> {
  if (node instanceof MutationRecord) {
    switch (node.type) {
      case "childList": {
        if (node.removedNodes?.length) {
          yield {
            kind: "recurse",
            context,
            children: node.removedNodes,
          };
        }
        if (node.addedNodes?.length) {
          yield {
            kind: "recurse",
            context,
            children: node.addedNodes,
          };
        }
        break;
      }
      case "attributes": {
        const element = node.target;
        const name = node.attributeName;
        if (name && name.includes("-") && element instanceof Element) {
          const attr = element.getAttributeNode(node.attributeName) ??
            undefined;
          yield {
            kind: "attr",
            context,
            attr,
            element,
            name: name,
            value: attr?.value,
            oldValue: node.oldValue ?? undefined,
            bindings: potentialBindings(name.split("-")),
          };
        }
      }
    }
  }
}

export default mutationRecordDetector;
