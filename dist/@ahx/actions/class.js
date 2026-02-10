
import { isElement } from "@ahx/common/guards.js";

const classModifyAction = (
  fn,
  minTokens = 1,
) =>
(...args) => {
  const [op, ...tokens] = args;
  if (!op) {
    throw new TypeError("An operation is required");
  }
  if (tokens.length < minTokens) {
    throw new TypeError(`At least ${minTokens} class name(s) are required`);
  }

  return ({ targets }) => {
    if (!targets) return;

    for (const target of targets) {
      if (isElement(target)) {
        fn(target, ...tokens);
      }
    }
  };
};

export const class_set = classModifyAction(
  (target, ...tokens) => target.className = tokens.join(" "),
);

export const class_empty = classModifyAction(
  (target) => target.className = "",
  0,
);

export const class_add = classModifyAction(
  (target, ...tokens) => target.classList.add(...tokens),
);

export const class_remove = classModifyAction(
  (target, ...tokens) => target.classList.remove(...tokens),
);

export const class_replace = classModifyAction(
  (target, token, newToken) => target.classList.replace(token, newToken),
  2,
);

export const class_toggle = classModifyAction(
  (target, ...tokens) => {
    for (const token of tokens) {
      target.classList.toggle(token);
    }
  },
);
