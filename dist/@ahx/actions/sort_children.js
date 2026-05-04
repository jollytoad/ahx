
import { isElement } from "@ahx/common/guards.js";

export const sort_children = (_op, ...args) => {
  const selector = args.join(" ");

  return ({ targets }) => {
    if (!targets) return;

    for (const target of targets) {
      sortChildren(target, selector);
    }
  };
};

function sortChildren(parent, selector) {
  const children = parent.childNodes;

  if (children.length > 1) {
    const moveBefore = "moveBefore" in parent
      ? (parent.moveBefore).bind(parent)
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

function nodeComparator(children, selector) {
  const values = getNodeValues(children, selector);

  return (nodeA, nodeB) => {
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
  nodes,
  selector,
) {
  const values = new Map();
  for (const node of nodes) {
    const value = getValue(node, selector);
    if (value) {
      values.set(node, value);
    }
  }
  return values;
}

function getValue(node, selector) {
  const valueNode = selector
    ? ((isElement(node) && node.querySelector(selector)) || undefined)
    : node;
  const value = valueNode?.textContent ?? undefined;
  if (value === undefined) return undefined;
  const asNumber = Number.parseFloat(value);
  if (!Number.isNaN(asNumber)) return asNumber;
  return value;
}
