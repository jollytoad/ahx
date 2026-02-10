
import { isElement } from "@ahx/common/guards.js";

export const morph = async (...args) => {
  const op = args[0] ?? "inner";
  const morphStyle = morphStyles[op];

  if (!morphStyle) {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const Idiomorph = await importIdiomorph();

  console.log("Idiomorph", Idiomorph);

  return async (
    { targets, texts, nodes, response, initialTarget, control },
  ) => {
    if (!targets) return;

    if (!nodes && !texts && response) {
      texts = [await response.text()];
    }

    if (
      !nodes && !texts && isElement(initialTarget) &&
      initialTarget !== control.root
    ) {
      nodes = [initialTarget];
    }

    let content;

    if (nodes) {
      for await (const node of nodes) {
        content = node;
        break;
      }
    } else if (texts) {
      content = texts[0];
    }

    if (content !== undefined) {
      for (const target of targets) {
        if (isElement(target)) {
          Idiomorph.morph(target, content, {
            morphStyle,
            ignoreActiveValue: true,
            head: { style: "none" },
          });
        }
      }
    }
  };
};

const morphStyles = {
  inner: "innerHTML",
  innerHTML: "innerHTML",
  outer: "outerHTML",
  outerHTML: "outerHTML",
};

async function importIdiomorph() {
  if ("Idiomorph" in window) {
    return window.Idiomorph;
  } else {
    return (await import("idiomorph")).Idiomorph;
  }
}
