
import { COLLAPSED, PREFIX, QUEUE } from "./config.js";
import { isNode } from "@ahx/common/guards.js";

const BOLD = "font-weight: bold;";
const CODE = "background-color: highlight;";
const RESET = "font-weight: normal; color: inherit; background-color: inherit;";
const PIPELINE = "color: light-dark(blue,skyblue);" + BOLD;
const ACTION_BEFORE = "color: light-dark(purple,hotpink);" + BOLD;
const ACTION_CANCEL = "color: red;" + BOLD;
const ACTION_ERROR = "color: yellow; background-color: red;" + BOLD;
const ACTION_AFTER = "color: light-dark(green,lime);" + BOLD;

const traces = new Map();

function log(trace, ...line) {
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

function dump(trace, forceExpand) {
  const queue = traces.get(trace) ?? [];
  traces.delete(trace);
  for (let [method, ...args] of queue) {
    if (forceExpand && method === "groupCollapsed") {
      method = "group";
    }
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
    wrapContext(context),
  );
}

export function afterPipeline(
  context,
  result,
) {
  log(context.trace, "groupEnd", result);
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
    wrapContext(context),
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
    wrapContext(context),
  );
}

export function errorAction(context) {
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
    wrapResult(result),
  );
}

function wrapContext(context) {
  return Object.assign(new class ActionContext {}(), context);
}

function wrapResult(result) {
  return result
    ? Object.assign(new class ActionResult {}(), result)
    : undefined;
}
