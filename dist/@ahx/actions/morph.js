
import { isMorphlexAvailable, morphMorphlex } from "./morph_morphlex.js";
import { isIdiomorphAvailable, morphIdiomorph } from "./morph_idiomorph.js";
import { swap } from "./swap.js";

export const morph = async (...args) => {
  const op = args[0] ?? "inner";

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
