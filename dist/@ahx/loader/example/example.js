import { createFeatureFinder } from "@ahx/loader/feature-finder.js";
import { createFeatureLoader } from "@ahx/loader/feature-loader.js";
import { recurseFeature } from "@ahx/detectors/recurse-feature.js";
import { recurseDocument } from "@ahx/detectors/recurse-document.js";
import { recurseElement } from "@ahx/detectors/recurse-element.js";
import { isElement } from "@ahx/common/guards.js";
import { potentialBindings } from "@ahx/common/potential-bindings.js";

function* fooDetector(
  node,
  context,
) {
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
  node,
  context,
) {
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

export async function exampleInit(doc) {
  const features = finder([doc], doc);
  const results = [];

  for (const feature of features) {
    const outcome = await loader(feature);
    if (outcome.status === "loaded") {
      results.push(await outcome.exportValue(outcome.feature));
    }
  }

  return results;
}
