
import { isElement } from "@ahx/common/guards.js";
import { getMorphContent } from "@ahx/common/morph.js";

export const morphIdiomorph = async (...args) => {
  const op = args[1] ?? "inner";
  const morphStyle = morphStyles[op];

  if (!morphStyle) {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const Idiomorph = await importIdiomorph();

  return async (context) => {
    const { targets } = context;
    if (!targets) return;

    const content = await getMorphContent(context);

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

export default morphIdiomorph;

const morphStyles = {
  inner: "innerHTML",
  outer: "outerHTML",
};

async function importIdiomorph() {
  if ("Idiomorph" in window) {
    return window.Idiomorph;
  } else {
    return (await import("idiomorph")).Idiomorph;
  }
}

export async function isIdiomorphAvailable() {
  try {
    return !!(await importIdiomorph());
  } catch {
    return false;
  }
}
