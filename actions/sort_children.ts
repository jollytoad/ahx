import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export const sort_children: ActionConstruct = (_op, ...args) => {
  const selector = args.join(" ");

  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    for (const target of targets) {
      sortChildren(target, selector);
    }
  };
};

function sortChildren(parent: Node, selector: string) {
  const children = parent.childNodes;

  if (children.length > 1) {
    const moveBefore = "moveBefore" in parent
      ? (parent.moveBefore as (typeof parent)["insertBefore"]).bind(parent)
      : parent.insertBefore.bind(parent);

    Array.from(children)
      .sort(nodeComparator(children, selector))
      .forEach((child, i) => {
        if (child !== children[i]) {
          moveBefore(child, children[i] ?? null);
        }
      });
  }
}

function nodeComparator(children: Iterable<Node>, selector: string) {
  const values = getNodeValues(children, selector);

  return (nodeA: Node, nodeB: Node) => {
    const valueA = values.get(nodeA);
    const valueB = values.get(nodeB);
    return valueA == valueB
      ? 0
      : (valueA ?? false) < (valueB ?? false)
      ? -1
      : 1;
  };
}

function getNodeValues(
  nodes: Iterable<Node>,
  selector: string,
): Map<Node, string | number> {
  const values = new Map<Node, string | number>();
  for (const node of nodes) {
    const value = getValue(node, selector);
    if (value) {
      values.set(node, value);
    }
  }
  return values;
}

function getValue(node: Node, selector: string): string | number | undefined {
  const valueNode = selector
    ? ((isElement(node) && node.querySelector(selector)) || undefined)
    : node;
  const value = valueNode?.textContent ?? undefined;
  if (value === undefined) return undefined;
  const asNumber = Number.parseFloat(value);
  if (!Number.isNaN(asNumber)) return asNumber;
  return value;
}
