import type { ActionContext } from "@ahx/types";

export function validateSelector(...args: string[]) {
  // TODO: better validation
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }
}

export function extendedSelectorAll(
  { control, event }: ActionContext,
  ...args: string[]
): Node[] {
  const [scope, ...rest] = args;
  const root = control.root;

  switch (scope) {
    case "this": {
      if (event.target instanceof Element) {
        if (rest.length) {
          return [...event.target.querySelectorAll(rest.join(" "))];
        } else {
          return [event.target];
        }
      }
      return [];
    }
    case "closest": {
      const closest = event.target instanceof Element &&
        event.target.closest(rest.join(" "));
      return closest ? [closest] : [];
    }
    case "previous": {
      return findSibling(event.target, "previousSibling", rest.join(" "));
    }
    case "next": {
      return findSibling(event.target, "nextSibling", rest.join(" "));
    }
    case "document": {
      return selectSelfOrDescendent(getDocument(event.target), ...rest);
    }
    case "head": {
      return selectDescendent(getDocument(event.target), "head", ...rest);
    }
    case "body": {
      return selectDescendent(getDocument(event.target), "body", ...rest);
    }
    case "shadowroot": {
      const shadowroot = event.target instanceof Element
        ? event.target.shadowRoot
        : null;
      return selectSelfOrDescendent(shadowroot, ...rest);
    }
    // TODO: other special scopes
    default:
      return selectDescendent(root, ...args);
  }
}

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

function getDocument(target: EventTarget | null) {
  return target instanceof Document
    ? target
    : target instanceof Node
    ? target.ownerDocument
    : null;
}

function selectSelfOrDescendent(root?: ParentNode | null, ...args: string[]) {
  if (root) {
    if (args.length) {
      return [...root.querySelectorAll(args.join(" "))];
    } else {
      return [root];
    }
  }
  return [];
}

function selectDescendent(root?: ParentNode | null, ...args: string[]) {
  return root ? [...root.querySelectorAll(args.join(" "))] : [];
}
