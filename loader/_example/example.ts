import { createFeatureFinder } from "@ahx/loader/feature-finder.ts";
import { createFeatureLoader } from "@ahx/loader/feature-loader.ts";
import { recurseFeature } from "@ahx/detectors/recurse-feature.ts";
import { recurseDocument } from "@ahx/detectors/recurse-document.ts";
import { recurseElement } from "@ahx/detectors/recurse-element.ts";
import { isElement } from "@ahx/common/guards.ts";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";
import type { Context } from "@ahx/types/feature.ts";
import type { BarFeature, FooFeature } from "./types.ts";

function* fooDetector(
  node: unknown,
  context?: Context,
): Iterable<FooFeature> {
  if (isElement(node)) {
    const foo = node.getAttribute("data-foo");
    if (typeof foo === "string") {
      yield {
        kind: "foo",
        context,
        foo,
        bindings: [["foo"]],
      };
    }
  }
}

function* barDetector(
  node: unknown,
  context?: Context,
): Iterable<BarFeature> {
  if (isElement(node) && node.localName.startsWith("bar-")) {
    yield {
      kind: "bar",
      context,
      bar: node.textContent,
      bindings: potentialBindings(node.localName.split("-")),
    };
  }
}

const finder = await createFeatureFinder([
  recurseFeature,
  recurseDocument,
  recurseElement,
  fooDetector,
  barDetector,
]);

const loader = createFeatureLoader({
  toModuleSpec() {
    return import.meta.resolve("./features.ts");
  },
  logBinding(outcome) {
    console.debug(outcome);
  },
});

export async function exampleInit(doc: Document): Promise<unknown[]> {
  const features = finder([doc], doc);
  const results: unknown[] = [];

  for (const feature of features) {
    const outcome = await loader(feature);
    if (outcome.status === "loaded") {
      results.push(await outcome.exportValue(outcome.feature));
    }
  }

  return results;
}
