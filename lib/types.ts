export type Prefix = "ahx";
export type CSSSelector = string;
export type CSSPropertyName = string;
export type EventType = string;
export type RuleId = string;
export type PseudoId = number | string;
export type PseudoPlace = "before" | "after";
export type HTML = string;
export type Owner = string;
export type ValueType = "tokens" | "whole";

export type AhxHttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete";

export type ControlPropName =
  | "import"
  | "deny-trigger"
  | "trigger"
  | "swap"
  | "harvest"
  | "target"
  | "include"
  | "slot"
  | "slot-name"
  | "rule"
  | `rule-${string}`
  | AhxHttpMethod;

export type RequestHeaderName =
  | "current-url"
  | "request";

export type ResponseHeaderName = "refresh";

export type HeaderName = RequestHeaderName | ResponseHeaderName;

export type AhxCSSPropertyName = `--${Prefix}-${ControlPropName}`;
export type AhxAttributeName = `${Prefix}-${ControlPropName}`;
export type AhxHeaderName = `${Prefix}-${HeaderName}`;

/** A thing that declares a Hypermedia Control */
export type ControlDecl = Element | CSSStyleRule;

/** Specification of a Hypermedia Control */
export interface ControlSpec {
  trigger: TriggerSpec;
  action: ActionSpec;
  swap: SwapSpec;
}

export interface TriggerSpec {
  eventType: EventType;
  pollInterval?: number;
  changed?: boolean;
  once?: boolean;
  delay?: number;
  throttle?: number;
  queue?: "first" | "last" | "all" | "none";
}

export interface ActionRequestSpec {
  type: "request";
  method: AhxHttpMethod;
  url?: URL;
}

export interface ActionHarvestSpec {
  type: "harvest";
}

export type ActionSpec = ActionRequestSpec | ActionHarvestSpec;

export type ActionType = ActionSpec["type"];

export interface Owners {
  /** The owner of the source element (where the event occurred) */
  sourceOwner?: Owner;
  /** The owner of the target element for the swap */
  targetOwner?: Owner;
  /** The owner of the control */
  controlOwner?: Owner;
}

export type SwapHtmlStyle =
  | "none"
  | "inner"
  | "outer"
  | InsertPosition;

export type SwapTextStyle =
  | "attr"
  | "input";

export type SwapStyle =
  | "none"
  | SwapHtmlStyle
  | SwapTextStyle;

export type SwapMerge =
  | "append"
  | "join";

export interface SwapSpec {
  swapStyle?: SwapStyle;
  delay?: number;
  itemName?: string; // name of input or attribute
  merge?: SwapMerge;
  separator?: string;
}

export interface TargetSpec {
  query: string;
}

export interface SwapProps extends SwapSpec, Owners {
  target: Element;
  response?: Response;
  value?: string;
}

export interface SwapHtmlProps extends SwapSpec, Owners {
  swapStyle: SwapHtmlStyle;
  target: Element;
  response: Response;
}

export interface SwapTextProps extends SwapSpec, Owners {
  swapStyle: SwapTextStyle;
  target: Element;
  itemName: string;
  value?: string;
}

export interface AhxEventMap {
  // [before detail, after detail]
  "startObserver": [MutationObserverInit, MutationObserverInit];
  "mutations": [
    MutationsDetail,
    MutationsDetail & ElementChanges,
  ];
  "processElements": [ProcessElementsDetail, ProcessElementsDetail];
  "processElement": [ProcessElementDetail, ProcessElementDetail];
  "processRules": [ProcessRulesDetail, ProcessRulesDetail];
  "processRule": [ProcessRuleDetail, ProcessRuleDetail];
  "cssImport": [CssImportDetail, CssImportDetail];
  "pseudoElement": [PseudoElementDetail, PseudoElementDetail];
  "pseudoRule": [
    PseudoRuleDetail,
    Omit<PseudoRuleDetail, "pseudoRule"> & WithPseudoRule,
  ];
  "processControl": [ControlDetail, ControlDetail];
  "addEventType": [EventTypeDetail, EventTypeDetail];
  "trigger": [TriggerDetail, TriggerDetail];
  "queue": [TriggerDetail, TriggerDetail];
  "action": [ActionDetail, ActionDetail];
  "navigate": [NavigateDetail, NavigateDetail];
  "swap": [SwapDetail, SwapDetail];
  "request": [RequestDetail, RequestDetail];
  "harvest": [HarvestDetail, HarvestDetail];
}

export interface AhxOneShotMap {
  "load": LoadDetail;
  "mutate": MutateDetail;
}

export interface AhxErrorMap {
  "pseudoElementNotPermitted": { parentTag: string };
  "invalidCssValue": {
    prop: CSSPropertyName;
    value?: string;
    rule: CSSStyleRule;
  };
  "triggerDenied": TriggerDetail;
  "invalidRequest": { action: ActionRequestSpec; reason: string };
}

export interface MutationsDetail {
  mutations: MutationRecord[];
}

export interface ElementChanges {
  removedElements: Set<Element>;
  addedElements: Set<Element>;
  mutatedElements: Set<Element>;
}

export interface ProcessElementsDetail {
  selectors: Set<CSSSelector>;
}

export interface ProcessElementDetail {
  owner?: Owner;
}

export interface ProcessRulesDetail {
  rules: Map<CSSStyleRule, Set<AhxCSSPropertyName>>;
}

export interface ProcessRuleDetail {
  rule: CSSStyleRule;
  props: Set<AhxCSSPropertyName>;
  owner?: Owner;
}

export interface CssImportDetail {
  url: string;
  crossOrigin?: string;
  disabled: boolean;
  owner?: Owner;
}

export interface PseudoElementDetail {
  pseudoElt: Element;
  pseudoId: PseudoId;
  place: PseudoPlace;
  owner?: Owner;
}

export interface PseudoRuleDetail {
  pseudoId: PseudoId;
  pseudoRule: Pick<
    CSSStyleRule,
    "selectorText" | "cssText" | "parentStyleSheet"
  >;
  rule: CSSStyleRule;
  place: PseudoPlace;
  owner?: Owner;
}

export interface WithPseudoRule {
  pseudoRule: CSSStyleRule;
}

export interface ControlDetail extends ControlSpec {
  /** The rule or element that declared the control */
  control: ControlDecl;
}

export interface EventTypeDetail {
  eventType: EventType;
}

/** The details for the handling of a triggered control */
export interface TriggerDetail extends ControlDetail, Owners {
  /** The trigging event */
  event?: Event;

  /** The element on which the event was triggered */
  source: Element;

  /** The target for the swap */
  target: Element | "await";
}

/** The details for performing the action of a control */
export interface ActionDetail extends TriggerDetail {
  target: Element;
  formData?: FormData;
}

/** The details for performing a browser navigation following an action */
export interface NavigateDetail extends ActionDetail {
  request: Request;
  response: Response;
  refresh?: boolean;
  url: URL;
}

/** The details for performing a swap for a control */
export type SwapDetail = SwapHtmlDetail | SwapTextDetail;

export interface SwapHtmlDetail extends SwapProps {
  swapStyle: SwapHtmlStyle;
  element: Element;
  previous?: Element;
  index: number;
  slot?: string;
}

export interface SwapTextDetail extends SwapProps {
  swapStyle: SwapTextStyle;
  input?: Element | RadioNodeList;
  formData?: FormData;
  oldValue?: string;
}

export interface RequestDetail {
  request: Request;
  response?: Response;
  error?: unknown;
}

export interface HarvestDetail extends Owners {
  source: Element;
  control: CSSStyleRule;
  newValue: string;
  oldValue?: string;
}

export interface LoadDetail {
  recursive?: boolean;
}

// deno-lint-ignore no-empty-interface
export interface MutateDetail {
}

export type AhxEventType =
  | keyof AhxEventMap
  | keyof AhxOneShotMap
  | keyof AhxErrorMap;

type BeforeEventMap = {
  [E in keyof AhxEventMap as `${Prefix}:${E}`]: CustomEvent<AhxEventMap[E][0]>;
};

type AfterEventMap = {
  [E in keyof AhxEventMap as `${Prefix}:${E}:done`]: CustomEvent<
    AhxEventMap[E][1]
  >;
};

type VetoEventMap = {
  [E in keyof AhxEventMap as `${Prefix}:${E}:veto`]: CustomEvent<
    AhxEventMap[E][0] & { reason?: string }
  >;
};

type ErrorEventMap = {
  [E in keyof AhxErrorMap as `${Prefix}:${E}:error`]: CustomEvent<
    AhxErrorMap[E]
  >;
};

type OneShotEventMap = {
  [E in keyof AhxOneShotMap as `${Prefix}:${E}`]: CustomEvent<
    AhxOneShotMap[E]
  >;
};

type DebugEventMap = {
  [K in Prefix]: CustomEvent<CustomEvent>;
};

type CustomEventMap =
  & OneShotEventMap
  & BeforeEventMap
  & AfterEventMap
  & VetoEventMap
  & ErrorEventMap;

declare global {
  // deno-lint-ignore no-empty-interface
  interface GlobalEventHandlersEventMap extends CustomEventMap {}

  // deno-lint-ignore no-empty-interface
  interface WindowEventMap extends DebugEventMap {}
}
