import type {
  Action,
  ActionConstruct,
  ActionDecl,
  ActionFeature,
  Config,
} from "@ahx/types";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";
import * as log from "@ahx/custom/log/feature.ts";
import { createFeatureLoader } from "./feature-loader.ts";
import { ACTION_NAME_REGEXP } from "./parse-pipeline.ts";

const EXT = import.meta.url.slice(import.meta.url.lastIndexOf("."));

export async function createAction(
  actionDecl: ActionDecl,
  { actionModulePrefix }: Pick<Config, "actionModulePrefix">,
): Promise<Action> {
  const loader = createFeatureLoader<ActionFeature, ActionConstruct>({
    toModuleSpec: (_feature, binding) =>
      `${actionModulePrefix}${binding.join("_")}${EXT}`,
  });

  const outcome = await loader({
    kind: "action",
    ...actionDecl,
    bindings: potentialBindings(
      [actionDecl.name, ...actionDecl.args],
      ACTION_NAME_REGEXP,
    ),
  });

  if (outcome && "exportValue" in outcome) {
    log.importFeature(outcome, " ");
    const { feature: { bindings: _, ...decl }, exportValue, moduleUrl } =
      outcome;
    const fn = await exportValue(...decl.args);
    return { ...decl, fn, moduleUrl };
  }

  throw new TypeError(`Unable to find action "${actionDecl.name}"`);
}
