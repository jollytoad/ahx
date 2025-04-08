import type {
  AttrFeature,
  Control,
  ControlDecl,
  Feature,
  FeatureDetector,
} from "@ahx/types";
import { createFeatureFinder } from "@ahx/core/feature-finder.ts";
import { createControl } from "@ahx/core/control.ts";
import { dispatchAhxEvent } from "@ahx/core/ahx-event.ts";
import { isDocument, isElement } from "@ahx/common/guards.ts";
import { parsePipeline } from "@ahx/core/parse-pipeline.ts";

const permittedActions = new Set([
  "get",
  "swap",
]);

export async function execReadyControls(
  root: unknown,
  detectors: FeatureDetector[],
  baseURI: string,
): Promise<void> {
  const finder = await createFeatureFinder(detectors);

  const features = finder([root], root);

  const promises = new Set<Promise<Control>>();

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

      const decl: ControlDecl = {
        root: feature.context,
        source: feature.element,
        eventType: "ready",
        pipelineStr: feature.value ?? "",
      };

      const control = await createControl(decl);

      if (control.eventTarget) {
        const readyDone = Promise.withResolvers<Control>();
        promises.add(readyDone.promise);

        // Bit of a hack
        // deno-lint-ignore no-explicit-any
        (control.eventTarget as any).baseURI = baseURI;

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

function isAttrFeature(feature: Feature): feature is AttrFeature {
  return feature.kind === "attr";
}
