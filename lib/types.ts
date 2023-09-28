export type Prefix = "ahx";
export type CSSSelector = string;
export type CSSPropertyName = string;
export type EventType = string;
export type PseudoId = number | string;
export type PseudoPlace = "before" | "after";
export type HTML = string;

export type AhxHttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete";

export type AhxName =
  | "import"
  | "deny-trigger"
  | "trigger"
  | "swap"
  | AhxHttpMethod;

export type AhxCSSPropertyName = `--${Prefix}-${AhxName}`;
export type AhxAttributeName = `${Prefix}-${AhxName}`;

export type TriggerOrigin = Element | CSSStyleRule;

export interface AhxTrigger {
  trigger: TriggerSpec;
  action: ActionSpec;
}

export interface TriggerSpec {
  eventType: EventType;
  pollInterval?: number;
  changed?: boolean;
  once?: boolean;
  delay?: number;
  from?: CSSSelector;
  target?: CSSSelector;
  throttle?: number;
  queue?: "first" | "last" | "all" | "none";
}

export interface ActionSpec {
  type: "request";
  method: string;
  url: string;
}

export type SwapStyle =
  | "none"
  | "innerhtml"
  | "outerhtml"
  | InsertPosition;

export interface SwapSpec {
  swapStyle: SwapStyle;
  swapDelay: number;
  settleDelay: number;
}

export interface AhxEventMap {
  // [before detail, after detail]
  "startObserver": [MutationObserverInit, MutationObserverInit];
  "mutations": [
    MutationsDetail,
    MutationsDetail & ElementChanges,
  ];
  "processTree": [ProcessTreeDetail, ProcessTreeDetail];
  "processElement": [ProcessElementDetail, ProcessElementDetail];
  "processStyleSheets": [
    ProcessStyleSheetsDetail,
    ProcessStyleSheetsDetail,
  ];
  "processRule": [ProcessRuleDetail, ProcessRuleDetail];
  "cssImport": [CssImportDetail, CssImportDetail];
  "pseudoElement": [PseudoElementDetail, PseudoElementDetail];
  "pseudoRule": [
    PseudoRuleDetail,
    Omit<PseudoRuleDetail, "pseudoRule"> & WithPseudoRule,
  ];
  "addTrigger": [AddTriggerDetail, AddTriggerDetail];
  "addEventType": [AddEventTypeDetail, AddEventTypeDetail];
  "trigger": [AhxTrigger, AhxTrigger];
  "performAction": [AhxTrigger, AhxTrigger];
  "swap": [SwapDetail, SwapDetail];
}

export interface AhxErrorMap {
  "triggerSyntax": { token: string | undefined };
  "pseudoElementNotPermitted": { parentTag: string };
  "invalidCssValue": {
    prop: CSSPropertyName;
    value?: string;
    rule: CSSStyleRule;
  };
  "triggerDenied": AhxTrigger;
}

export interface MutationsDetail {
  mutations: MutationRecord[];
}

export interface ElementChanges {
  removedElements: Element[];
  addedElements: Element[];
}

export interface ProcessTreeDetail {
  selector: CSSSelector;
}

// deno-lint-ignore no-empty-interface
export interface ProcessElementDetail {
}

export interface ProcessStyleSheetsDetail {
  cssRules: Map<CSSStyleRule, Set<AhxCSSPropertyName>>;
}

export interface ProcessRuleDetail {
  rule: CSSStyleRule;
  props: Set<AhxCSSPropertyName>;
}

export interface CssImportDetail {
  url: string;
  crossOrigin?: string;
  disabled: boolean;
}

export interface PseudoElementDetail {
  pseudoElt: Element;
  pseudoId: PseudoId;
  place: PseudoPlace;
}

export interface PseudoRuleDetail {
  pseudoId: PseudoId;
  pseudoRule: Pick<
    CSSStyleRule,
    "selectorText" | "cssText" | "parentStyleSheet"
  >;
  rule: CSSStyleRule;
  place: PseudoPlace;
}

export interface WithPseudoRule {
  pseudoRule: CSSStyleRule;
}

export interface AddTriggerDetail extends AhxTrigger {
  origin: TriggerOrigin;
}

export interface AddEventTypeDetail {
  eventType: EventType;
}

export interface SwapDetail extends SwapSpec {
  content: HTML;
}

type BeforeEventMap = {
  [E in keyof AhxEventMap as `${Prefix}:${E}`]: CustomEvent<AhxEventMap[E][0]>;
};

type AfterEventMap = {
  [E in keyof AhxEventMap as `${Prefix}:${E}:done`]: CustomEvent<
    AhxEventMap[E][1]
  >;
};

type ErrorEventMap = {
  [E in keyof AhxErrorMap as `${Prefix}:${E}:error`]: CustomEvent<
    AhxErrorMap[E]
  >;
};

type CustomEventMap =
  & BeforeEventMap
  & AfterEventMap
  & ErrorEventMap
  & {
    [K in Prefix]: CustomEvent<CustomEvent>;
  };

declare global {
  interface EventTarget {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
      options?: AddEventListenerOptions | boolean,
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
      options?: EventListenerOptions | boolean,
    ): void;
  }
  // Document doesn't extend EventTarget, so we have to declare
  // the event listener overrides again!...
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
      options?: AddEventListenerOptions | boolean,
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
      options?: EventListenerOptions | boolean,
    ): void;
  }
}
