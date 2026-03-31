import type { Context } from "@ahx/types";

export interface FooFeature {
  kind: "foo";
  context?: Context;
  foo: string;
  bindings?: string[][];
}

export interface BarFeature {
  kind: "bar";
  context?: Context;
  bar: string;
  bindings?: string[][];
}
