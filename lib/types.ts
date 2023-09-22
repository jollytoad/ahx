export type Prefix = "ahx";
export type CSSSelector = string;
export type CSSPropertyName = string;
export type EventType = string;
export type PseudoId = number | string;
export type PseudoPlace = "before" | "after";
export type HTML = string;

export type RuleTarget = Element | CSSStyleRule;

export interface AhxRule {
  target: WeakRef<RuleTarget>;
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

export type SwapStyle = "none" | "innerhtml" | "outerhtml" | InsertPosition;

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
    MutationsDetail & RuleChanges & ElementChanges,
  ];
  "processTree": [ProcessTreeDetail, ProcessTreeDetail & RuleChanges];
  "processElement": [ProcessElementDetail, ProcessElementDetail & RuleChanges];
  "processStyleSheets": [
    ProcessStyleSheetsDetail,
    ProcessStyleSheetsDetail & RuleChanges,
  ];
  "cssImport": [CssImportDetail, CssImportDetail];
  "pseudoElement": [PseudoElementDetail, PseudoElementDetail];
  "pseudoRule": [
    PseudoRuleDetail,
    Omit<PseudoRuleDetail, "pseudoRule"> & WithPseudoRule & RuleChanges,
  ];
  "addRule": [AhxRule, AhxRule];
  "addEventType": [AddEventTypeDetail, AddEventTypeDetail];
  "triggerRule": [AhxRule, AhxRule];
  "performAction": [AhxRule, AhxRule];
  "swap": [SwapDetail, SwapDetail];

  // [error detail]
  "triggerSyntax": [{ token: string | undefined }];
  "pseudoElementNotPermitted": [{ parentTag: string }];
}

export interface MutationsDetail {
  mutations: MutationRecord[];
}

export interface RuleChanges {
  removedRules: AhxRule[];
  addedRules: AhxRule[];
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
  cssRules: Map<CSSStyleRule, Set<CSSPropertyName>>;
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

type CustomEventMap = BeforeEventMap & AfterEventMap & {
  Prefix: CustomEvent<CustomEvent>;
};

declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;
  }
}
