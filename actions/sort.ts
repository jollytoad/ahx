import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export const sort_children: ActionConstruct = (_op, ...args) => {
  let reverse = false;

  switch (args[0]) {
    case "descending":
      reverse = true;
      // fallthrough
    case "ascending":
      args.shift();
      break;
  }

  const selector = args.join(" ");

  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    for (const target of targets) {
      sortChildren(target, selector, reverse);
    }
  };
};

export const sort_column: ActionConstruct = (_op, direction) => {
  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    const [target] = targets;

    if (!target || !isElement(target) || !target.parentElement) return;

    const targetIndex = Array.from(target.parentElement.children).indexOf(
      target,
    );

    if (targetIndex === -1) return;

    const reverse = (!direction || direction === "toggle")
      ? target.ariaSort === "ascending"
      : direction === "descending";

    // TODO: look for table-like roles if table/tbody is not found
    const parent = target.closest("table")?.querySelector("tbody");

    if (!parent) return;

    // TODO: deal with colspan's

    sortChildren(parent, `td:nth-child(${targetIndex + 1})`, reverse);

    for (const heading of target.parentElement.children) {
      heading.ariaSort = heading === target
        ? (reverse ? "descending" : "ascending")
        : null;
    }
  };
};

function sortChildren(parent: Node, selector: string, reverse: boolean) {
  const children = parent.childNodes;

  if (children.length > 1) {
    const moveBefore = "moveBefore" in parent
      ? (parent.moveBefore as (typeof parent)["insertBefore"]).bind(parent)
      : parent.insertBefore.bind(parent);

    Array.from(children)
      .sort(nodeComparator(children, selector, reverse))
      .forEach((child, i) => {
        if (child !== children[i]) {
          moveBefore(child, children[i] ?? null);
        }
      });
  }
}

function nodeComparator(
  children: Iterable<Node>,
  selector: string,
  reverse: boolean,
) {
  const values = getNodeValues(children, selector);
  const less = reverse ? 1 : -1;
  const more = reverse ? -1 : 1;

  return (nodeA: Node, nodeB: Node) => {
    const valueA = values.get(nodeA);
    const valueB = values.get(nodeB);
    return valueA == valueB
      ? 0
      : (valueA ?? false) < (valueB ?? false)
      ? less
      : more;
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
