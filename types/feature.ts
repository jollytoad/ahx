import type { Awaitable } from "./general.ts";

export type Context = unknown;

export type FeatureFinder = (
  things: Iterable<unknown>,
  context: Context,
) => Iterable<Feature>;

export type FeatureDetector = (
  thing: unknown,
  context?: Context,
) => Iterable<Feature>;

export type FeatureLoader<F extends Feature = Feature, V = FeatureInit> = (
  feature: F,
) => Promise<FeatureOutcome<F, V>>;

export interface Feature {
  kind?: string;
  context?: Context;
  children?: Iterable<unknown>;
  bindings?: string[][];
  ignore?: boolean;
}

export interface IgnoreFeature {
  ignore?: boolean;
}

export interface RecurseFeature {
  kind: "recurse";
  context?: Context;
  children: Iterable<unknown>;
}

export interface ObserveFeature {
  kind: "observe";
  context: Node;
  bindings?: string[][];
}

export interface AttrFeature {
  kind: "attr";
  context?: Context;
  attr?: Attr;
  element: Element;
  name: string;
  value?: string;
  oldValue?: string;
  bindings?: string[][];
}

export interface ElementFeature {
  kind: "element";
  context?: Context;
  element: Element;
  name: string;
  bindings?: string[][];
}

export interface MetaFeature {
  kind: "meta";
  context?: Context;
  element: HTMLMetaElement;
  name: string;
  value: string;
  bindings?: string[][];
}

export interface CSSPropertyFeature {
  kind: "cssprop";
  context?: Context;
  rule: CSSStyleRule;
  name: string;
  value: string;
  bindings?: string[][];
}

export interface FeatureLoaded<F extends Feature = Feature, V = FeatureInit> {
  feature: F;
  moduleUrl: string;
  moduleBinding: string[];
  exportBinding?: string[];
  exportName: string;
  exportValue: V;
}

export interface FeatureFailed<F extends Feature = Feature> {
  feature: F;
  error?: unknown;
}

export type FeatureOutcome<F extends Feature = Feature, V = FeatureInit> =
  | FeatureLoaded<F, V>
  | FeatureFailed<F>;

export type FeatureInit = (feature: Feature) => unknown;

export interface FeatureLoaderOptions<
  F extends Feature = Feature,
  V = FeatureInit,
> {
  isValidExport?: (
    detail: FeatureLoaded<F, unknown>,
  ) => detail is FeatureLoaded<F, V>;
  toModuleSpec?: (feature: Feature, binding: string[]) => string;
  toExportName?: (feature: Feature, binding: string[]) => string;
  importModule?: (url: string) => Promise<Record<string, unknown>>;
}

export type LazyFeatureDetector = Awaitable<
  FeatureDetector | { default?: FeatureDetector } | undefined
>;
