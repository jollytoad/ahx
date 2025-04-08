import { isElement, isNode, isShadowRoot } from "./guards.ts";

export type SwapOp =
  | "none"
  | "inner"
  | "innerHTML"
  | "outer"
  | "outerHTML"
  | "text"
  | "textContent"
  | "delete"
  | "empty"
  | InsertPosition;

/**
 * Swap the target node for the given node, html or text string.
 * @param op defines the swap style of operation
 * @returns the last node swapped into place unless nothing could be swapped in
 */
export function swap(
  op: SwapOp,
  target?: Node | null,
  node?: Node | string | null,
): Node | undefined {
  return (isNode(target) && swapHandlers[op]?.(target, node ?? null)) ||
    undefined;
}

type SwapHandler = (target: Node, node: Node | string | null) => Node | void;

const swapAdjacent = (pos: InsertPosition): SwapHandler => (target, node) => {
  if (isElement(target) && typeof node === "string") {
    target.insertAdjacentHTML(pos, node);
    // TODO: return last element inserted
  } else if (isElement(target) && isElement(node)) {
    return target.insertAdjacentElement(pos, node) ?? undefined;
  } else if (isNode(target) && isNode(node)) {
    switch (pos) {
      case "beforebegin":
        return target.parentNode?.insertBefore(node, target);
      case "afterbegin":
        return target.insertBefore(node, target.firstChild);
      case "beforeend":
        return target.appendChild(node);
      case "afterend":
        if (target.nextSibling) {
          return target.parentNode?.insertBefore(node, target.nextSibling);
        } else {
          return target.parentNode?.appendChild(node);
        }
    }
  }
};

const swapInner: SwapHandler = (target, node) => {
  if (
    (isElement(target) || isShadowRoot(target)) && node !== null
  ) {
    if (typeof node === "string") {
      target.innerHTML = node;
      return target.lastChild ?? undefined;
    } else if (isNode(node)) {
      target.replaceChildren(node);
      return node;
    }
  } else if (isNode(node)) {
    while (target.lastChild) {
      target.removeChild(target.lastChild);
    }
    target.appendChild(node);
    return node;
  }
};

const swapOuter: SwapHandler = (target, node) => {
  if (isElement(target)) {
    const { parentNode, nextSibling } = target;
    if (typeof node === "string") {
      target.outerHTML = node;
      return (nextSibling
        ? nextSibling.previousSibling
        : parentNode?.lastChild) ?? undefined;
    } else if (isNode(node)) {
      target.replaceWith(node);
      return node;
    }
  } else if (target.parentNode && isNode(node)) {
    target.parentNode.replaceChild(target, node);
    return node;
  }
};

const swapText: SwapHandler = (target, node) => {
  const text = typeof node === "string"
    ? node
    : isElement(node) && "innerText" in node &&
        typeof node.innerText === "string"
    ? node.innerText
    : node
    ? node.textContent
    : null;

  if (text !== null) {
    target.textContent = text;
    return target.lastChild ?? undefined;
  }
};

const swapHandlers: Record<SwapOp, SwapHandler> = {
  none() {
    // no-op
  },
  delete(target) {
    target.parentNode?.removeChild(target);
  },
  empty(target) {
    if (isElement(target)) {
      target.replaceChildren();
    } else {
      while (target.lastChild) {
        target.removeChild(target.lastChild);
      }
    }
  },
  text: swapText,
  textContent: swapText,
  inner: swapInner,
  innerHTML: swapInner,
  outer: swapOuter,
  outerHTML: swapOuter,
  beforebegin: swapAdjacent("beforebegin"),
  afterbegin: swapAdjacent("afterbegin"),
  beforeend: swapAdjacent("beforeend"),
  afterend: swapAdjacent("afterend"),
};
