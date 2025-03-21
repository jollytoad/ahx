import type { ActionConstruct, ActionResult } from "@ahx/types";

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
          if (target instanceof HTMLFormElement) {
            const input = target.elements.namedItem(name);
            if (input instanceof HTMLInputElement && input.type === "hidden") {
              input.remove();
            }
            // TODO: what would be the expected behaviour for visible elements?
          }
        }
        return;
      case "get": {
        const result = { nodes: [] as Node[], texts: [] as string[] };
        for (const target of targets) {
          if (target instanceof HTMLFormElement) {
            const input = target.elements.namedItem(name);
            if (input instanceof NodeList) {
              result.nodes.push(...input);
            } else if (input instanceof Node) {
              result.nodes.push(input);
            }
            if (input instanceof RadioNodeList) {
              if (input.value) {
                result.texts.push(input.value);
              } else {
                result.texts.push(
                  ...[...input].flatMap((node) =>
                    node instanceof HTMLInputElement ? [node.value] : []
                  ),
                );
              }
            } else if (input instanceof HTMLInputElement) {
              result.texts.push(input.value);
            }
          }
        }
        return result;
      }
    }

    for (const target of targets) {
      if (target instanceof HTMLFormElement) {
        const input = target.elements.namedItem(name);
        const newValues = (argsValue ? [argsValue] : texts) ?? [];

        switch (op) {
          case "join": {
            if (input instanceof HTMLInputElement) {
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
