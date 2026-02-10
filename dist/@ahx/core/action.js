
import { potentialBindings } from "@ahx/common/potential-bindings.js";
import { featureOutcome } from "@ahx/custom/log/feature.js";
import { bindingOutcome } from "@ahx/custom/log/binding.js";
import allowBinding from "@ahx/custom/filter.js";
import { createFeatureLoader } from "./feature-loader.js";
import { ACTION_NAME_REGEXP } from "./parse-pipeline.js";

const EXT = import.meta.url.slice(import.meta.url.lastIndexOf("."));

export async function createAction(
  actionDecl,
  { actionModulePrefix },
) {
  const loader = createFeatureLoader({
    allowBinding,
    logBinding: (outcome) => bindingOutcome(outcome, "-"),
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

  featureOutcome(outcome, " ");

  if (outcome.status === "loaded") {
    const { feature: { bindings: _, ...decl }, exportValue, moduleUrl } =
      outcome;
    const fn = await exportValue(...decl.args);
    return { ...decl, fn, moduleUrl };
  }

  throw new TypeError(`Unable to find action "${actionDecl.name}"`);
}
