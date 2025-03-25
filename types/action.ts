import type { ActionContext } from "./action-context.ts";
import type { ActionResult } from "./action-result.ts";
import type { Awaitable } from "./general.ts";

export type ActionName = string;

export type ActionSpecifier = string;

export type ActionArgs = string[];

/**
 * An Action function, pre-constructed from it's args,
 * and ready to execute given a context.
 */
export type ActionPerform = (
  context: ActionContext,
) => Awaitable<ActionResult | void>;

/**
 * An Action construction function, that creates the
 * `ActionPerform` fn given a set of args.
 */
export type ActionConstruct =
  & ((...args: ActionArgs) => Awaitable<ActionPerform>)
  & { moduleUrl?: string };

/**
 * An Action declaration within a pipeline of a hypermedia control.
 */
export interface ActionDecl {
  name: ActionName;
  args: ActionArgs;
}

/**
 * A fully resolved and loaded Action, ready to execute.
 */
export interface Action extends ActionDecl {
  fn: ActionPerform;
  moduleUrl?: string;
}

export interface ActionFeature extends ActionDecl {
  kind: "action";
  bindings?: string[][];
}
