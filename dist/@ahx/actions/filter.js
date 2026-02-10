
import { isElement } from "@ahx/common/guards.js";

export const filter_nodes = (...args) => {
  const [, cssPropName, ...values] = validate(args);

  return ({ nodes }) => {
    if (nodes) {
      return {
        nodes: filterAsync(nodes, hasStylePropValue(cssPropName, values)),
        texts: undefined,
      };
    }
  };
};

export const filter_targets = (...args) => {
  const [, cssPropName, ...values] = validate(args);

  return ({ targets }) => {
    if (targets) {
      return {
        targets: targets.filter(hasStylePropValue(cssPropName, values)),
      };
    }
  };
};

const hasStylePropValue =
  (cssPropName, values) => (node) => {
    if (!(isElement(node))) return false;
    const value = getComputedStyle(node).getPropertyValue(cssPropName);
    if (values.length === 0) {
      return !!value;
    } else {
      return value.includes(values[0]);
    }
  };

async function* filterAsync(
  nodes,
  fn,
) {
  for await (const node of nodes) {
    const result = fn(node);
    if (result === true) {
      yield node;
    }
  }
}

function validate(args) {
  const [contextPropName, cssPropName] = args;

  if (!contextPropName && !cssPropName) {
    throw new TypeError(
      "A context property name and a CSS property name is required",
    );
  }

  return args;
}
