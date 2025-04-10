/// <reference types="./_idiomorph.d.ts" />
// deno-lint-ignore-file no-window
import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export type MorphOp =
  | "inner"
  | "innerHTML"
  | "outer"
  | "outerHTML";

type MorphStyle = "innerHTML" | "outerHTML";

export const morph: ActionConstruct = async (...args) => {
  const op: MorphOp = args[0] as MorphOp ?? "inner";
  const morphStyle = morphStyles[op];

  if (!morphStyle) {
    throw new TypeError(`Invalid morph op: ${op}`);
  }

  const Idiomorph = await importIdiomorph();

  console.log("Idiomorph", Idiomorph);

  return async (
    { targets, texts, nodes, response, initialTarget, control },
  ): Promise<ActionResult | undefined> => {
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

    let content: Node | string | undefined;

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

const morphStyles: Record<MorphOp, MorphStyle> = {
  inner: "innerHTML",
  innerHTML: "innerHTML",
  outer: "outerHTML",
  outerHTML: "outerHTML",
};

async function importIdiomorph(): Promise<Idiomorph> {
  if ("Idiomorph" in window) {
    return window.Idiomorph as Idiomorph;
  } else {
    return (await import("idiomorph")).Idiomorph as Idiomorph;
  }
}
