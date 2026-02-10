
import { isElement } from "@ahx/common/guards.js";

export const attr_get = (...args) => {
  const [_op, name] = validate(args);

  return ({ targets }) => {
    if (!targets) return;

    const result = { nodes: [], texts: [] };
    for (const target of targets) {
      if (isElement(target)) {
        const attr = target.getAttributeNode(name);
        if (attr) {
          result.nodes.push(attr);
          result.texts.push(attr.value);
        }
      }
    }
    return result;
  };
};

export const attr_remove = (...args) => {
  const [_op, name] = validate(args);

  return ({ targets }) => {
    if (!targets) return;

    for (const target of targets) {
      if (isElement(target)) {
        target.removeAttribute(name);
      }
    }
  };
};

const attrModifyAction = (
  fn,
) =>
(...args) => {
  const [_op, name, ...rest] = validate(args);
  const argsValue = rest.length ? rest.join(" ") : undefined;

  return ({ targets, texts }) => {
    if (!targets) return;

    for (const target of targets) {
      if (isElement(target)) {
        const currValue = target.getAttribute(name) ?? undefined;
        const newValue = fn(currValue, argsValue ?? texts?.[0], name);

        if (newValue !== undefined && newValue !== currValue) {
          target.setAttribute(name, newValue);
        }
      }
    }
  };
};

export const attr_add = attrModifyAction(
  (oldVal, newVal, name) =>
    oldVal !== undefined
      ? oldVal
      : newVal !== undefined
      ? newVal
      : name.startsWith("aria-")
      ? "true"
      : "",
);

export const attr_set = attrModifyAction(
  (_, val) => val,
);

export const attr_append = attrModifyAction(
  (oldVal, newVal) => oldVal && newVal ? [oldVal, newVal].join(" ") : newVal,
);

export const attr_join = attr_append;

export const attr_include = attrModifyAction(
  (oldVal, newVal) =>
    oldVal && newVal && !` ${oldVal} `.includes(` ${newVal} `)
      ? [oldVal, newVal].join(" ")
      : newVal,
);

export const attr_exclude = attrModifyAction(
  (oldVal, newVal) =>
    oldVal && newVal && ` ${oldVal} `.includes(` ${newVal} `)
      ? ` ${oldVal} `.replace(` ${newVal} `, " ").slice(1, -1)
      : oldVal,
);

function validate(args) {
  if (!args[0] || !args[1]) {
    throw new TypeError("An operation and attribute name are required");
  }
  return args;
}
