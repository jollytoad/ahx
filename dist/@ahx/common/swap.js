import { isElement, isNode, isShadowRoot } from "./guards.js";

export function swap(
  op,
  target,
  node,
) {
  return (isNode(target) && swapHandlers[op]?.(target, node ?? null)) ||
    undefined;
}

const swapAdjacent = (pos) => (target, node) => {
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

const swapInner = (target, node) => {
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

const swapOuter = (target, node) => {
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

const swapText = (target, node) => {
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

const swapHandlers = {
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
  inner: swapInner,
  outer: swapOuter,
  before: swapAdjacent("beforebegin"),
  after: swapAdjacent("afterend"),
  prepend: swapAdjacent("afterbegin"),
  append: swapAdjacent("beforeend"),
};
