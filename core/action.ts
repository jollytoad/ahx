import type {
  Action,
  ActionConstruct,
  ActionDecl,
  ActionFeature,
} from "@ahx/types";
import { getConfig } from "@ahx/common/config.ts";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";
import * as log from "@ahx/common/logging.ts";
import { createFeatureLoader } from "./feature-loader.ts";
import { ACTION_NAME_REGEXP } from "./parse-pipeline.ts";

export async function createAction(
  actionDecl: ActionDecl,
  root: ParentNode,
): Promise<Action> {
  const { actionModulePrefix } = getConfig(root, "actionModulePrefix") ?? "";

  const loader = createFeatureLoader<ActionFeature, ActionConstruct>({
    toModuleSpec: (_feature, binding) =>
      `${actionModulePrefix}${binding.join("_")}`,
  });

  const outcome = await loader({
    ...actionDecl,
    bindings: potentialBindings(
      [actionDecl.name, ...actionDecl.args],
      ACTION_NAME_REGEXP,
    ),
  });

  if (outcome && "exportValue" in outcome) {
    log.importAction(outcome);
    const { feature: { bindings: _, ...decl }, exportValue, moduleUrl } =
      outcome;
    const fn = await exportValue(...decl.args);
    return { ...decl, fn, moduleUrl };
  }

  throw new TypeError(`Unable to find action "${actionDecl.name}"`);
}
