import type { ActionConstruct, ActionResult } from "@ahx/types";

export const filter_nodes: ActionConstruct = (...args) => {
  const [, cssPropName, ...values] = validate(args);

  return ({ nodes }): ActionResult | undefined => {
    if (nodes) {
      return {
        nodes: filterAsync(nodes, hasStylePropValue(cssPropName, values)),
        texts: undefined,
      };
    }
  };
};

export const filter_targets: ActionConstruct = (...args) => {
  const [, cssPropName, ...values] = validate(args);

  return ({ targets }): ActionResult | undefined => {
    if (targets) {
      return {
        targets: targets.filter(hasStylePropValue(cssPropName, values)),
      };
    }
  };
};

const hasStylePropValue =
  (cssPropName: string, values: string[]) => (node: Node): boolean => {
    if (!(node instanceof Element)) return false;
    const value = getComputedStyle(node).getPropertyValue(cssPropName!);
    if (values.length === 0) {
      return !!value;
    } else {
      return value.includes(values[0]!);
    }
  };

async function* filterAsync<N>(
  nodes: Iterable<N> | AsyncIterable<N>,
  fn: (node: N) => boolean,
): AsyncIterable<N> {
  for await (const node of nodes) {
    const result = fn(node);
    if (result === true) {
      yield node;
    }
  }
}

function validate(args: string[]): [string, string, ...string[]] {
  const [contextPropName, cssPropName] = args;

  if (!contextPropName && !cssPropName) {
    throw new TypeError(
      "A context property name and a CSS property name is required",
    );
  }

  return args as [string, string, ...string[]];
}
