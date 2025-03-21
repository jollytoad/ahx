import type { ActionDecl } from "@ahx/types";

export const ACTION_NAME_REGEXP = /^[a-z][a-zA-Z0-9\-]*$/;

export function parsePipeline(source: string): ActionDecl[] {
  return source.trim().split(/\s+\|\>\s+/).map((actionString) => {
    const [name, ...args] = actionString.split(/\s+/);
    if (!name) {
      throw new TypeError(`Missing action name in pipeline: "${source}"`);
    }
    if (!ACTION_NAME_REGEXP.test(name)) {
      throw new TypeError(`Invalid action name in pipeline: "${name}"`);
    }
    const actionStr = [name, ...args].join(" ");
    return {
      name,
      args,
      toString() {
        return actionStr;
      },
    };
  });
}

export function stringifyPipeline(actions: readonly ActionDecl[]): string {
  return actions.map((action) => action.toString()).join(" |> ");
}

export function normalizePipeline(source: string): string {
  return source.replaceAll(/\s+/g, " ").trim();
}
