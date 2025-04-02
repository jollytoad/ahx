import type { ActionContext, ActionResult } from "@ahx/types";
import { COLLAPSED, PREFIX, QUEUE } from "./config.ts";

const BOLD = "font-weight: bold;";
const CODE = "background-color: highlight;";
const RESET = "font-weight: normal; color: inherit; background-color: inherit;";
const PIPELINE = "color: light-dark(blue,skyblue);" + BOLD;
const ACTION_BEFORE = "color: light-dark(purple,hotpink);" + BOLD;
const ACTION_CANCEL = "color: red;" + BOLD;
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
    dump(trace);
  }
}

function dump(trace: string) {
  const queue = traces.get(trace) ?? [];
  traces.delete(trace);
  for (const [method, ...args] of queue) {
    // deno-lint-ignore no-explicit-any
    (console[method] as any)(...args);
  }
}

export function beforePipeline(context: ActionContext): void {
  const source = context.control.source;
  const s = source instanceof Node ? "%o" : "%O";

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
    context,
  );
}

export function afterPipeline(
  _context: ActionContext,
  _result: ActionResult | void,
): void {
  log(_context.trace, "groupEnd");
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
    context,
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
    context,
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
    result,
  );
}
