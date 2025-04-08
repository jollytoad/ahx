import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

const classModifyAction = (
  fn: (target: Element, ...tokens: string[]) => void,
  minTokens: number = 1,
): ActionConstruct =>
(...args) => {
  const [op, ...tokens] = args;
  if (!op) {
    throw new TypeError("An operation is required");
  }
  if (tokens.length < minTokens) {
    throw new TypeError(`At least ${minTokens} class name(s) are required`);
  }

  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    for (const target of targets) {
      if (isElement(target)) {
        fn(target, ...tokens);
      }
    }
  };
};

export const class_set: ActionConstruct = classModifyAction(
  (target, ...tokens) => target.className = tokens.join(" "),
);

export const class_empty: ActionConstruct = classModifyAction(
  (target) => target.className = "",
  0,
);

export const class_add: ActionConstruct = classModifyAction(
  (target, ...tokens) => target.classList.add(...tokens),
);

export const class_remove: ActionConstruct = classModifyAction(
  (target, ...tokens) => target.classList.remove(...tokens),
);

export const class_replace: ActionConstruct = classModifyAction(
  (target, token, newToken) => target.classList.replace(token, newToken),
  2,
);

export const class_toggle: ActionConstruct = classModifyAction(
  (target, ...tokens) => {
    for (const token of tokens) {
      target.classList.toggle(token);
    }
  },
);
