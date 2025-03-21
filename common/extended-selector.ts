import type { ActionContext } from "@ahx/types";

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

    // TODO: other special scopes
    default:
      return root ? [...root.querySelectorAll(args.join(" "))] : [];
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
