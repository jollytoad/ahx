export type Prefix = "ahx";
export type CSSSelector = string;
export type CSSPropertyName = string;
export type EventType = string;
export type PseudoId = number | string;
export type PseudoPlace = "before" | "after";
export type HTML = string;
export type Owner = string;

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
  | "value"
  | "target"
  | "input"
  | "include"
  | AhxHttpMethod;

export type AhxCSSPropertyName = `--${Prefix}-${AhxName}`;
export type AhxAttributeName = `${Prefix}-${AhxName}`;

export type TriggerOrigin = Element | CSSStyleRule;

export interface AhxTrigger {
  trigger: TriggerSpec;
  action: ActionSpec;
}

export interface HandleTriggerDetail extends AhxTrigger {
  target: Element;
  origin: TriggerOrigin;
  owner?: Owner;
}

export interface HandleActionDetail extends HandleTriggerDetail {
  formData?: FormData;
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
  "handleTrigger": [HandleTriggerDetail, HandleTriggerDetail];
  "handleAction": [HandleTriggerDetail, HandleTriggerDetail];
  "swap": [SwapDetail, SwapDetail];
  "processValue": [ProcessValueDetail, ProcessValueDetail];
  "updateForm": [UpdateFormDetail, UpdateFormDetail];
  "request": [RequestDetail, RequestDetail];
}

export interface AhxErrorMap {
  "triggerSyntax": { token: string | undefined };
  "pseudoElementNotPermitted": { parentTag: string };
  "invalidCssValue": {
    prop: CSSPropertyName;
    value?: string;
    rule: CSSStyleRule;
  };
  "triggerDenied": HandleTriggerDetail;
  "multipleValueRuleOwners": { owners: Set<Owner> };
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

export interface ProcessElementDetail {
  owner?: Owner;
}

export interface ProcessStyleSheetsDetail {
  cssRules: Map<CSSStyleRule, Set<AhxCSSPropertyName>>;
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

export interface AddTriggerDetail extends AhxTrigger {
  origin: TriggerOrigin;
}

export interface AddEventTypeDetail {
  eventType: EventType;
}

export interface SwapDetail extends SwapSpec {
  element: Element;
  previous?: Element;
  index: number;
  owner?: Owner;
}

export interface ProcessValueDetail {
  target?: Element;
  inputName?: string;
  oldValue?: string | File;
  newValue: string;
  ruleOwner?: Owner;
  sourceOwner?: Owner;
  targetOwner?: Owner;
}

export interface UpdateFormDetail {
  target: Element;
  inputName: string;
  input?: Element | RadioNodeList;
  formData?: FormData;
  oldValue?: string | File;
  newValue: string;
  ruleOwner?: Owner;
  sourceOwner?: Owner;
  targetOwner?: Owner;
}

export interface RequestDetail {
  request: Request;
  response?: Response;
  error?: unknown;
}

export type AhxEventType = keyof AhxEventMap | keyof AhxErrorMap;

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
