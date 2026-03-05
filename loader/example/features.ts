import type { BarFeature, FooFeature } from "./types.ts";

export function foo(feature: FooFeature): string {
  console.log("Foo:", feature.foo);
  return feature.foo;
}

export function bar(feature: BarFeature): string {
  console.log("Bar:", feature.bar);
  return feature.bar;
}
