
import { isElement } from "@ahx/common/guards.js";
import { getMorphContent } from "@ahx/common/morph.js";

export const morphMorphlex = async (...args) => {
  const op = args[1] ?? "inner";
  const morphFn = morphFns[op];

  if (!morphFn) {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const morphlex = await import("morphlex");

  return async (context) => {
    const { targets } = context;
    if (!targets) return;

    const content = await getMorphContent(context);

    if (content !== undefined) {
      for (const target of targets) {
        if (isElement(target)) {
          morphlex[morphFn](target, content);
        }
      }
    }
  };
};

export default morphMorphlex;

const morphFns = {
  inner: "morphInner",
  outer: "morph",
};

export async function isMorphlexAvailable() {
  try {
    return !!(await import("morphlex"));
  } catch {
    return false;
  }
}
