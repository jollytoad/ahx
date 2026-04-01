import type { ActionConstruct } from "@ahx/types";
import { isMorphlexAvailable, morphMorphlex } from "./morph_morphlex.ts";
import { isIdiomorphAvailable, morphIdiomorph } from "./morph_idiomorph.ts";
import { swap } from "./swap.ts";

export type MorphOp =
  | "inner"
  | "outer";

export const morph: ActionConstruct = async (...args) => {
  const op: MorphOp = args[0] as MorphOp ?? "inner";

  if (op !== "inner" && op !== "outer") {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const [hasMorphlex, hasIdiomorph] = await Promise.all([
    isMorphlexAvailable(),
    isIdiomorphAvailable(),
  ]);

  if (hasMorphlex) {
    console.debug("morphlex");
    return morphMorphlex("morphlex", ...args);
  } else if (hasIdiomorph) {
    console.debug("idiomorph");
    return morphIdiomorph("idiomorph", ...args);
  } else {
    console.debug("no morph");
    return swap(...args);
  }
};
