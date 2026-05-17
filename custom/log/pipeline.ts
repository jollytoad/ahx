import type { ActionContext, ActionResult } from "@ahx/types";
import { COLLAPSED, PREFIX, QUEUE } from "./config.ts";
import { isNode } from "@ahx/common/guards.ts";

const BOLD = "font-weight: bold;";
const CODE = "background-color: highlight;";
const RESET = "font-weight: normal; color: inherit; background-color: inherit;";
const PIPELINE = "color: light-dark(blue,skyblue);" + BOLD;
const ACTION_BEFORE = "color: light-dark(purple,hotpink);" + BOLD;
const ACTION_CANCEL = "color: red;" + BOLD;
const ACTION_ERROR = "color: yellow; background-color: red;" + BOLD;
const ACTION_AFTER = "color: light-dark(green,lime);" + BOLD;

type LogLine = [keyof typeof console, ...unknown[]];

const traces = new Map<string, LogLine[]>();

function log(trace: string, ...line: LogLine) {
  let queue = traces.get(trace);
  if (!queue) {
    traces.set(trace, queue = []);
  }
  queue.push(line);
  if (!QUEUE || line[0] === "groupEnd") {
    const forceExpand = line[0] === "groupEnd" && !!line[1] &&
      typeof line[1] === "object" && "error" in line[1];
    dump(trace, forceExpand);
  }
}

function dump(trace: string, forceExpand?: boolean) {
  const queue = traces.get(trace) ?? [];
  traces.delete(trace);
  for (let [method, ...args] of queue) {
    if (forceExpand && method === "groupCollapsed") {
      method = "group";
    }
    // deno-lint-ignore no-explicit-any
    (console[method] as any)(...args);
  }
}

export function beforePipeline(context: ActionContext): void {
  const source = context.control.source;
  const s = isNode(source) ? "%o" : "%O";

  log(
    context.trace,
    COLLAPSED ? "groupCollapsed" : "group",
    `${PREFIX}%c%s%c %c%s%c ${s} %O`,
    PIPELINE,
    `on-${context.control.eventType}`,
    RESET,
    CODE,
    context.control,
    RESET,
    source,
    wrapContext(context),
  );
}

export function afterPipeline(
  context: ActionContext,
  result: ActionResult | void,
): void {
  log(context.trace, "groupEnd", result);
}

export function beforeAction(context: ActionContext): void {
  log(
    context.trace,
    "debug",
    `${PREFIX}%c%s%c %c%s%c %O`,
    ACTION_BEFORE,
    "action",
    RESET,
    BOLD + CODE,
    context.action,
    RESET,
    wrapContext(context),
  );
}

export function cancelAction(context: ActionContext): void {
  log(
    context.trace,
    "debug",
    `${PREFIX}%c%s%c %c%s%c %O`,
    ACTION_CANCEL,
    "cancel",
    RESET,
    BOLD + CODE,
    context.action?.name,
    RESET,
    wrapContext(context),
  );
}

export function errorAction(context: ActionContext): void {
  log(
    context.trace,
    "debug",
    `${PREFIX}%c%s%c %c%s%c %O`,
    ACTION_ERROR,
    "error!",
    RESET,
    BOLD + CODE,
    context.action?.name,
    RESET,
    wrapContext(context),
  );
}

export function afterAction(
  context: ActionContext,
  result: ActionResult | void,
): void {
  log(
    context.trace,
    "debug",
    `${PREFIX}%c%s%c %c%s%c %O`,
    ACTION_AFTER,
    "result",
    RESET,
    BOLD + CODE,
    context.action?.name,
    RESET,
    wrapResult(result),
  );
}

// This is just so the object appears with the name 'ActionContext' in the console
function wrapContext(context: ActionContext): ActionContext {
  return Object.assign(new class ActionContext {}(), context);
}

// This is just so the object appears with the name 'ActionResult' in the console
function wrapResult(result: ActionResult | void): ActionResult | undefined {
  return result
    ? Object.assign(new class ActionResult {}(), result)
    : undefined;
}
