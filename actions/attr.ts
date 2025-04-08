import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export const attr_get: ActionConstruct = (...args) => {
  const [_op, name] = validate(args);

  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    const result = { nodes: [] as Node[], texts: [] as string[] };
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

export const attr_remove: ActionConstruct = (...args) => {
  const [_op, name] = validate(args);

  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    for (const target of targets) {
      if (isElement(target)) {
        target.removeAttribute(name);
      }
    }
  };
};

const attrModifyAction = (
  fn: (
    oldValue: string | undefined,
    newValue: string | undefined,
    name: string,
  ) => string | undefined,
): ActionConstruct =>
(...args) => {
  const [_op, name, ...rest] = validate(args);
  const argsValue = rest.length ? rest.join(" ") : undefined;

  return ({ targets, texts }): ActionResult | undefined => {
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

export const attr_add: ActionConstruct = attrModifyAction(
  (oldVal, newVal, name) =>
    oldVal !== undefined
      ? oldVal
      : newVal !== undefined
      ? newVal
      : name.startsWith("aria-")
      ? "true"
      : "",
);

export const attr_set: ActionConstruct = attrModifyAction(
  (_, val) => val,
);

export const attr_append: ActionConstruct = attrModifyAction(
  (oldVal, newVal) => oldVal && newVal ? [oldVal, newVal].join(" ") : newVal,
);

export const attr_join: ActionConstruct = attr_append;

export const attr_include: ActionConstruct = attrModifyAction(
  (oldVal, newVal) =>
    oldVal && newVal && !` ${oldVal} `.includes(` ${newVal} `)
      ? [oldVal, newVal].join(" ")
      : newVal,
);

export const attr_exclude: ActionConstruct = attrModifyAction(
  (oldVal, newVal) =>
    oldVal && newVal && ` ${oldVal} `.includes(` ${newVal} `)
      ? ` ${oldVal} `.replace(` ${newVal} `, " ").slice(1, -1)
      : oldVal,
);

function validate(args: string[]): [string, string, ...string[]] {
  if (!args[0] || !args[1]) {
    throw new TypeError("An operation and attribute name are required");
  }
  return args as [string, string, ...string[]];
}
