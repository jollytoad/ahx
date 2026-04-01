import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";
import type * as Morphlex from "morphlex";
import { getMorphContent } from "@ahx/common/morph.ts";

export type MorphOp =
  | "inner"
  | "outer";

export const morphMorphlex: ActionConstruct = async (...args) => {
  const op: MorphOp = args[1] as MorphOp ?? "inner";
  const morphFn = morphFns[op];

  if (!morphFn) {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const morphlex = await import("morphlex");

  return async (context): Promise<ActionResult | undefined> => {
    const { targets } = context;
    if (!targets) return;

    const content = await getMorphContent(context);

    if (content !== undefined) {
      for (const target of targets) {
        if (isElement(target)) {
          morphlex[morphFn](target, content as ChildNode);
        }
      }
    }
  };
};

export default morphMorphlex;

const morphFns: Record<
  MorphOp,
  keyof Pick<typeof Morphlex, "morph" | "morphInner">
> = {
  inner: "morphInner",
  outer: "morph",
};

export async function isMorphlexAvailable(): Promise<boolean> {
  try {
    return !!(await import("morphlex"));
  } catch {
    return false;
  }
}
