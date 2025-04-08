import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement, isNode } from "@ahx/common/guards.ts";

export const input: ActionConstruct = (...args) => {
  const [op, name, ...rest] = args;
  const argsValue = rest.length ? rest.join(" ") : undefined;

  if (!op || !name) {
    throw new TypeError("An operation and form input name are required");
  }

  return ({ targets, texts }): ActionResult | undefined => {
    if (!targets) return;

    switch (op) {
      case "remove":
        // Only remove hidden input element
        for (const target of targets) {
          if (isFormElement(target)) {
            const input = target.elements.namedItem(name);
            if (
              isElement<HTMLInputElement>(input, "input") &&
              input.type === "hidden"
            ) {
              input.remove();
            }
            // TODO: what would be the expected behaviour for visible elements?
          }
        }
        return;
      case "get": {
        const result = { nodes: [] as Node[], texts: [] as string[] };
        for (const target of targets) {
          if (isFormElement(target)) {
            const input = target.elements.namedItem(name);
            if (isNode(input)) {
              result.nodes.push(input);
            } else if (input) {
              result.nodes.push(...input);
            }
            if (hasValue(input) && input.value) {
              if (typeof input.value === "string") {
                result.texts.push(input.value);
              } else {
                result.texts.push(
                  ...[...input].flatMap((node) =>
                    hasValue(node) ? [node.value] : []
                  ),
                );
              }
            }
          }
        }
        return result;
      }
    }

    for (const target of targets) {
      if (isFormElement(target)) {
        const input = target.elements.namedItem(name);
        const newValues = (argsValue ? [argsValue] : texts) ?? [];

        switch (op) {
          case "join": {
            if (hasValue(input)) {
              const currValue = input.value;
              input.value = (currValue ? [currValue, ...newValues] : newValues)
                .join(" ");
              break;
            }
          }
          /* falls through */
          case "append": {
            for (const newValue of newValues) {
              target.insertAdjacentElement(
                "beforeend",
                createInput(name, newValue, target.ownerDocument),
              );
            }
            break;
          }
        }
      }
    }
  };
};

function createInput(name: string, value: string, document: Document) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  return input;
}

function isFormElement(node: unknown): node is HTMLFormElement {
  return isElement<HTMLFormElement>(node, "form");
}

function hasValue(node: unknown): node is { value: string } {
  return !!node && typeof node === "object" && "value" in node;
}
