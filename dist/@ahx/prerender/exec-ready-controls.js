
import { createFeatureFinder } from "@ahx/core/feature-finder.js";
import { createControl } from "@ahx/core/control.js";
import { dispatchAhxEvent } from "@ahx/core/ahx-event.js";
import { isDocument, isElement } from "@ahx/common/guards.js";
import { parsePipeline } from "@ahx/core/parse-pipeline.js";

const permittedActions = new Set([
  "get",
  "swap",
]);

export async function execReadyControls(
  root,
  detectors,
  baseURI,
) {
  const finder = await createFeatureFinder(detectors);

  const features = finder([root], root);

  const promises = new Set();

  features:
  for (const feature of features) {
    if (
      isAttrFeature(feature) && feature.name === "on-ready" &&
      (isElement(feature.context) || isDocument(feature.context))
    ) {
      const pipeline = parsePipeline(feature.value ?? "");

      for (const actionDecl of pipeline) {
        if (!permittedActions.has(actionDecl.name)) break features;
      }

      const decl = {
        root: feature.context,
        source: feature.element,
        eventType: "ready",
        pipelineStr: feature.value ?? "",
      };

      const control = await createControl(decl);

      if (control.eventTarget) {
        const readyDone = Promise.withResolvers();
        promises.add(readyDone.promise);

                        (control.eventTarget).baseURI = baseURI;

        control.eventTarget.addEventListener(
          control.eventType,
          async (event) => {
            try {
              await control.execPipeline(event);
              if (isElement(control.source)) {
                control.source.removeAttribute("on-ready");
                console.debug(`Prerendered: ${control}`);
              }
            } catch (e) {
              console.error(e);
            } finally {
              readyDone.resolve(control);
            }
          },
          { once: true },
        );

        dispatchAhxEvent("ready", control.eventTarget, {
          control,
          bubbles: false,
          composed: false,
        });
      }
    }
  }

  await Promise.all(promises);
}

function isAttrFeature(feature) {
  return feature.kind === "attr";
}
