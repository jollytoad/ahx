import type { ActionResult } from "./action-result.ts";
import type { Action } from "./action.ts";
import type {
  ControlNodes,
  RootNode,
  SourceElement,
  SourceRule,
} from "./dom.ts";

export type EventType = string;

export type PipelineString = string;

/**
 * A Hypermedia Control declaration
 */
export type ControlDecl = ElementControlDecl | RuleControlDecl;

export type ControlSource = ControlDecl["source"];

/**
 * A control that applies to a specific Element
 */
export interface ElementControlDecl {
  /**
   * The root node of this control.
   */
  root: RootNode;
  /**
   * The source of this control.
   */
  source: SourceElement;
  /**
   * The event type that trigger this pipeline.
   */
  eventType: string;
  /**
   * The raw pipeline string.
   */
  pipelineStr: string;
}

export type FindRuleNodes = (this: Control) => Iterable<Node>;
export type MatchRuleNode = (this: Control, node: Node) => boolean;

export interface RuleControlDecl extends Omit<ElementControlDecl, "source"> {
  /**
   * The source of this control, may be a CSS style rule.
   */
  source: SourceRule;
  /**
   * Function to return the nodes to which this rule applies,
   * at the current point in time.
   */
  ruleNodes: FindRuleNodes;
  /**
   * Function to determine if this rule applies to a given node.
   */
  ruleApplies: MatchRuleNode;
}

/**
 * A Hypermedia Control that is ready to rumble.
 * It's pipeline has been parsed and resolved to a list of
 * ready to execute Actions.
 */
export interface Control extends AbortController, EventListenerObject {
  /**
   * Whether this control is a rule that applies dynamically to many nodes,
   * or just to a constant single node.
   */
  readonly isRule: boolean;
  /**
   * The root node of this control.
   */
  readonly root?: RootNode;
  /**
   * The source of this control, may be an element attribute, or
   * a CSS style rule.
   */
  readonly source?: ControlSource;
  /**
   * The event type that trigger this pipeline.
   */
  readonly eventType: string;
  /**
   * The target on which the event listener should be registered for this control.
   */
  readonly eventTarget?: EventTarget;
  /**
   * The pipeline of actions for this control
   */
  readonly actions: ReadonlyArray<Action>;
  /**
   * Return the nodes that this Control applies to.
   */
  nodes(): ControlNodes;
  /**
   * Determines whether the control is no longer active.
   */
  isDead(): boolean;
  /**
   * Execute the pipeline of the control and return the final result
   */
  execPipeline(event: Event): Promise<ActionResult | void>;
}
