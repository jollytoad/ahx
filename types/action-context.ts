import type { ActionResult } from "./action-result.ts";
import type { Action } from "./action.ts";
import type { Control } from "./control.ts";

/**
 * Context data passed from action to action throughout pipeline execution.
 */
export interface ActionContext extends ActionResult {
  /**
   * Unique identifier for the pipeline execution
   */
  trace: string;
  /**
   * The triggered control
   */
  control: Control;
  /**
   * The event that triggered this
   */
  event: Event;
  /**
   * The initial target of the pipeline
   */
  initialTarget: EventTarget;
  /**
   * The current Action being executed
   */
  action?: Action;
  /**
   * The index of current action being executed within the pipeline
   */
  index: number;
  /**
   * Any action that performs an async task should listen on
   * this signal and abort if it is triggered.
   */
  signal: AbortSignal;
}
