import type { Awaitable } from "./general.ts";

/**
 * Some arbitrary context to pass to feature detectors.
 */
export type Context = unknown;

/**
 * A function that finds features given a bunch of things.
 */
export type FeatureFinder = (
  things: Iterable<unknown>,
  context: Context,
) => Iterable<Feature>;

/**
 * A function that detects features for a given thing.
 */
export type FeatureDetector = (
  thing: unknown,
  context?: Context,
) => Iterable<Feature>;

/**
 * A function that attempts to load a module for a found feature.
 */
export type FeatureLoader<F extends Feature = Feature, V = FeatureInit> = (
  feature: F,
) => Promise<FeatureOutcome<F, V>>;

/**
 * A discovered feature.
 */
export interface Feature {
  kind?: string;
  context?: Context;
  children?: Iterable<unknown>;
  bindings?: string[][];
  ignore?: boolean;
}

/**
 * Indicates that no further feature detection should be performed on a thing.
 */
export interface IgnoreFeature {
  ignore?: boolean;
}

/**
 * A feature that contains children that should be probed for further features.
 */
export interface RecurseFeature {
  kind: "recurse";
  context?: Context;
  children: Iterable<unknown>;
}

/**
 * A feature that should be observed for mutations.
 */
export interface ObserveFeature {
  kind: "observe";
  context?: Context;
  node: Node;
  bindings?: string[][];
}

/**
 * An Attribute of a DOM Element.
 */
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

/**
 * An Element in the DOM.
 */
export interface ElementFeature {
  kind: "element";
  context?: Context;
  element: Element;
  name: string;
  bindings?: string[][];
}

/**
 * A 'meta' Element in the DOM.
 */
export interface MetaFeature {
  kind: "meta";
  context?: Context;
  element: HTMLMetaElement;
  name: string;
  value: string;
  bindings?: string[][];
}

/**
 * A property in a CSS rule.
 */
export interface CSSPropertyFeature {
  kind: "cssprop";
  context?: Context;
  rule: CSSStyleRule;
  name: string;
  value: string;
  bindings?: string[][];
}

/**
 * The outcome of an attempt to load a feature.
 */
export type FeatureOutcome<F extends Feature = Feature, V = FeatureInit> =
  | FeatureStatic<F>
  | FeatureLoaded<F, V>
  | FeatureNotFound<F>
  | FeatureIgnored<F>;

/**
 * A static feature outcome, for a feature that doesn't need loading (such as "recurse")
 */
export interface FeatureStatic<F extends Feature = Feature> {
  status: "static";
  feature: F;
}

/**
 * A feature was successfully loaded, and a valid exported value was found in the module.
 */
export interface FeatureLoaded<F extends Feature = Feature, V = FeatureInit> {
  status: "loaded";
  feature: F;
  moduleUrl: string;
  moduleBinding: string[];
  exportBinding?: string[];
  exportName: string;
  exportValue: V;
}

/**
 * A valid module and/or export value could not be found for the feature binding.
 */
export interface FeatureNotFound<F extends Feature = Feature> {
  status: "notFound";
  feature: F;
  moduleUrl?: string;
  moduleBinding?: string[];
}

/**
 * The feature binding was explicitly ignored by the `allowBinding` function.
 */
export interface FeatureIgnored<F extends Feature = Feature> {
  status: "ignored";
  feature: F;
  moduleBinding?: string[];
}

/**
 * A feature initialization function exported from the loaded feature module.
 */
export type FeatureInit = (feature: Feature) => unknown;

/**
 * Options for the feature loader
 */
export interface FeatureLoaderOptions<
  F extends Feature = Feature,
  V = FeatureInit,
> {
  /**
   * Check the export is valid for the feature
   */
  isValidExport?: (
    detail: FeatureLoaded<F, unknown>,
  ) => detail is FeatureLoaded<F, V>;
  /**
   * Convert the feature binding to a module specifier
   */
  toModuleSpec?: (feature: Feature, binding: string[]) => string;
  /**
   * Convert the feature binding to the name of an exported module value
   */
  toExportName?: (feature: Feature, binding: string[]) => string;
  /**
   * Attempt to import the module from the given URL
   */
  importModule?: (url: string) => Promise<Record<string, unknown>>;
  /**
   * Should we attempt to load a module for the feature binding?
   */
  allowBinding?: (feature: Feature, binding: string[]) => Awaitable<boolean>;
  /**
   * Log the outcome of attempting to load the feature for a given binding
   */
  logBinding?: (outcome: FeatureOutcome<Feature, unknown>) => Awaitable<void>;
}

/**
 * A lazily loaded feature detector function or module exporting it as the default function.
 */
export type LazyFeatureDetector = Awaitable<
  FeatureDetector | { default?: FeatureDetector } | undefined
>;
