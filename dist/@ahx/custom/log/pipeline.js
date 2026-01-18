
import { COLLAPSED, PREFIX, QUEUE } from "./config.js";
import { isNode } from "@ahx/common/guards.js";

const BOLD = "font-weight: bold;";
const CODE = "background-color: highlight;";
const RESET = "font-weight: normal; color: inherit; background-color: inherit;";
const PIPELINE = "color: light-dark(blue,skyblue);" + BOLD;
const ACTION_BEFORE = "color: light-dark(purple,hotpink);" + BOLD;
const ACTION_CANCEL = "color: red;" + BOLD;
const ACTION_AFTER = "color: light-dark(green,lime);" + BOLD;

const traces = new Map();

function log(trace, ...line) {
  let queue = traces.get(trace);
  if (!queue) {
    traces.set(trace, queue = []);
  }
  queue.push(line);
  if (!QUEUE || line[0] === "groupEnd") {
    dump(trace);
  }
}

function dump(trace) {
  const queue = traces.get(trace) ?? [];
  traces.delete(trace);
  for (const [method, ...args] of queue) {
        (console[method])(...args);
  }
}

export function beforePipeline(context) {
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
    context,
  );
}

export function afterPipeline(
  _context,
  _result,
) {
  log(_context.trace, "groupEnd");
}

export function beforeAction(context) {
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

export function cancelAction(context) {
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
  context,
  result,
) {
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
