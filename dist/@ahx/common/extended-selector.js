
import { isDocument, isElement, isNode, isShadowRoot } from "./guards.js";

export function validateSelector(...args) {
    if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }
}

export function extendedSelector(
  scope,
  { control, initialTarget },
  ...args
) {
  const rootScope = isNode(control.root) ? [control.root] : [];
  const eventScope = isNode(initialTarget) ? [initialTarget] : [];

  let [op, ...rest] = args;
  let limit = "all";
  let relative = false;

  switch (op) {
    case "first":
    case "last":
    case "all": {
      limit = op;
      [op, ...rest] = rest;
    }
  }

  switch (op) {
    case "this": {
      scope = eventScope;
      relative = true;
      [op, ...rest] = rest;
      break;
    }
    case "root": {
      scope = rootScope;
      relative = true;
      [op, ...rest] = rest;
      break;
    }
    case "scope": {
      relative = true;
      [op, ...rest] = rest;
      break;
    }
  }

  const forScope = forScopeFns[limit];
  let selector = rest.join(" ");

  const relativeScope = scope ?? eventScope;

  switch (op) {
    case "closest": {
      return forScope(
        relativeScope,
        (node) => isElement(node) ? node.closest(selector) : null,
      );
    }
    case "previous": {
      return forScope(
        relativeScope,
        (node) => findSibling(node, "previousSibling", selector),
      );
    }
    case "next": {
      return forScope(
        relativeScope,
        (node) => findSibling(node, "nextSibling", selector),
      );
    }
    case "document": {
      return forScope(
        relativeScope,
        (node) => select(getDocument(node), selector),
      );
    }
    case "head": {
      return forScope(
        relativeScope,
        (node) => select(getDocument(node)?.head, selector),
      );
    }
    case "body": {
      return forScope(
        relativeScope,
        (node) => select(getDocument(node)?.body, selector),
      );
    }
    case "shadowroot": {
      return forScope(
        relativeScope,
        (node) => select(getShadowRoot(node), selector),
      );
    }
    case "host": {
      return forScope(relativeScope, (node) => select(getHost(node), selector));
    }
    default: {
      selector = [op, ...rest].join(" ");
      return forScope(
        relative ? relativeScope : rootScope,
        (node) => select(node, selector, relative),
      );
    }
  }
}

const forScopeFns = {
  all(scope, callback) {
    const results = new Set();
    for (const node of scope) {
      if (isNode(node)) {
        const found = callback(node);
        if (isNode(found)) {
          results.add(found);
        } else if (found) {
          found.forEach((n) => results.add(n));
        }
      }
    }
    return [...results];
  },

  first(scope, callback) {
    for (const node of scope) {
      if (isNode(node)) {
        const found = callback(node);
        if (isNode(found)) {
          return [found];
        } else if (found && found[0]) {
          return [found[0]];
        }
      }
    }
    return [];
  },

  last(scope, callback) {
    let last;
    for (const node of scope) {
      if (isNode(node)) {
        const found = callback(node);
        if (isNode(found)) {
          last = found;
        } else if (found && found.length) {
          last = found[found.length - 1];
        }
      }
    }
    return last ? [last] : [];
  },
};

function findSibling(
  start,
  method,
  selector,
) {
  if (isNode(start)) {
    let sibling = start[method];
    while (sibling) {
      if (
        !selector || (isElement(sibling) && sibling.matches(selector))
      ) {
        return [sibling];
      }
      sibling = sibling[method];
    }
  }
  return [];
}

function getDocument(node) {
  return isDocument(node) ? node : node.ownerDocument;
}

function getShadowRoot(node) {
  return isShadowRoot(node) ? node : isElement(node) ? node.shadowRoot : null;
}

function getHost(node) {
  return isShadowRoot(node)
    ? node.host
    : isElement(node)
    ? node.shadowRoot?.host ?? null
    : null;
}

function select(
  node,
  selector,
  selfIfNoSelector = true,
) {
  if (
    node && "querySelectorAll" in node &&
    typeof node.querySelectorAll === "function"
  ) {
    if (selector) {
      return [...node.querySelectorAll(selector)];
    } else if (selfIfNoSelector) {
      return [node];
    }
  }
  return [];
}
