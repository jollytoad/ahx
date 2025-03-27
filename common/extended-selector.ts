import type { ActionContext } from "@ahx/types";

export function validateSelector(...args: string[]) {
  // TODO: better validation
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }
}

/**
 * Extended selector:
 *
 * `[<limit>] [<scope>] [<axis>] [<selectors>]`
 *
 * - limit: `first`, `last`, or `all` (defaults to `all`)
 * - scope:
 *    `this` - the event target
 *    `root` - the root element of the control, usually body, or a shadow root
 *    `scope` - within the current scope
 *    (defaults to the most appropriate for the axis)
 * - axis:
 *    `closest` - find the closest ancestor
 *    `previous` - find the nearest preceding sibling
 *    `next` - find the nearest following sibling
 */
export function extendedSelector(
  scope: Node[] | undefined,
  { control, event }: ActionContext,
  ...args: string[]
): Node[] {
  const rootScope = control.root instanceof Node ? [control.root] : [];
  const eventScope = event.target instanceof Node ? [event.target] : [];

  let [op, ...rest] = args;
  let limit: "first" | "last" | "all" = "all";
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
        (node) => node instanceof Element ? node.closest(selector) : null,
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

type Scope = (Node | EventTarget | null)[];

const forScopeFns = {
  all(scope: Scope, callback: (node: Node) => Node[] | Node | null): Node[] {
    const results = new Set<Node>();
    for (const node of scope) {
      if (node instanceof Node) {
        const found = callback(node);
        if (found instanceof Node) {
          results.add(found);
        } else if (found) {
          found.forEach((n) => results.add(n));
        }
      }
    }
    return [...results];
  },

  first(scope: Scope, callback: (node: Node) => Node[] | Node | null): Node[] {
    for (const node of scope) {
      if (node instanceof Node) {
        const found = callback(node);
        if (found instanceof Node) {
          return [found];
        } else if (found && found[0]) {
          return [found[0]];
        }
      }
    }
    return [];
  },

  last(scope: Scope, callback: (node: Node) => Node[] | Node | null): Node[] {
    let last: Node | undefined;
    for (const node of scope) {
      if (node instanceof Node) {
        const found = callback(node);
        if (found instanceof Node) {
          last = found;
        } else if (found && found.length) {
          last = found[found.length - 1]!;
        }
      }
    }
    return last ? [last] : [];
  },
};

function findSibling(
  start: EventTarget | null,
  method: "previousSibling" | "nextSibling",
  selector?: string,
) {
  if (start instanceof Node) {
    let sibling = start[method];
    while (sibling) {
      if (
        !selector || (sibling instanceof Element && sibling.matches(selector))
      ) {
        return [sibling];
      }
      sibling = sibling[method];
    }
  }
  return [];
}

function getDocument(node: Node): Document | null {
  return node instanceof Document ? node : node.ownerDocument;
}

function getShadowRoot(node: Node): ShadowRoot | null {
  return node instanceof ShadowRoot
    ? node
    : node instanceof Element
    ? node.shadowRoot
    : null;
}

function getHost(node: Node): Element | null {
  return node instanceof ShadowRoot
    ? node.host
    : node instanceof Element
    ? node.shadowRoot?.host ?? null
    : null;
}

function select(
  node: Node | null | undefined,
  selector: string,
  selfIfNoSelector = true,
): Node[] {
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
