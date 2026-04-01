/// <reference types="./_idiomorph.d.ts" />
// deno-lint-ignore-file no-window
import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";
import { getMorphContent } from "@ahx/common/morph.ts";

export type MorphOp =
  | "inner"
  | "outer";

type MorphStyle = "innerHTML" | "outerHTML";

export const morphIdiomorph: ActionConstruct = async (...args) => {
  const op: MorphOp = args[1] as MorphOp ?? "inner";
  const morphStyle = morphStyles[op];

  if (!morphStyle) {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const Idiomorph = await importIdiomorph();

  return async (context): Promise<ActionResult | undefined> => {
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

const morphStyles: Record<MorphOp, MorphStyle> = {
  inner: "innerHTML",
  outer: "outerHTML",
};

async function importIdiomorph(): Promise<Idiomorph> {
  if ("Idiomorph" in window) {
    return window.Idiomorph as Idiomorph;
  } else {
    return (await import("idiomorph")).Idiomorph as Idiomorph;
  }
}

export async function isIdiomorphAvailable(): Promise<boolean> {
  try {
    return !!(await importIdiomorph());
  } catch {
    return false;
  }
}
