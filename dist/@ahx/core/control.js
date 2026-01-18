
import { parsePipeline, stringifyPipeline } from "./parse-pipeline.js";
import { execPipeline } from "./exec-pipeline.js";
import { isActionEvent } from "./action-event.js";
import { createAction } from "./action.js";
import { getConfig } from "@ahx/custom/config.js";
import { isDocument, isNode, isShadowRoot } from "@ahx/common/guards.js";

export async function createControl(decl) {
  const { root, pipelineStr } = decl;

  const actionDecls = parsePipeline(pipelineStr);
  const actions = Object.freeze(await createActions(actionDecls, root));

  return Object.freeze(new ControlImpl(decl, actions));
}

function createActions(
  decls,
  root,
) {
  const config = getConfig(root, "actionModulePrefix");
  return Promise.all(decls.map((decl) => createAction(decl, config)));
}

class ControlImpl {
  #root;
  #source;
  #abortController;
  #pipelineStr;
  #ruleNodes;
  #ruleApplies;

  isRule;
  eventType;
  actions;

  constructor(
    decl,
    actions,
  ) {
    this.#root = new WeakRef(decl.root);
    this.#source = new WeakRef(decl.source);
    this.actions = actions;
    this.eventType = decl.eventType;

    this.#ruleNodes = "ruleNodes" in decl ? decl.ruleNodes : undefined;
    this.#ruleApplies = "ruleApplies" in decl ? decl.ruleApplies : undefined;
    this.isRule = !!this.#ruleNodes;

    this.#addAbortController();
  }

  get root() {
    return this.#root?.deref();
  }
  get source() {
    return this.#source?.deref();
  }
  get eventTarget() {
    const { root, source } = this;
    return this.isRule
      ? root
      : source instanceof EventTarget
      ? source
      : undefined;
  }

  nodes() {
    return this.#ruleNodes
      ? this.#ruleNodes?.apply(this)
      : isNode(this.source)
      ? [this.source]
      : [];
  }

  #doNotHandle(event) {
    return this.isDead() ||
      !isNode(event.target) ||
      (isActionEvent(event) &&
        (event.eventPhase !== Event.AT_TARGET || event.context.break ||
          event.context.signal.aborted)) ||
      (this.isRule && !this.#ruleApplies?.call(this, event.target));
  }

  #initialTarget(event) {
    const target = this.isRule ? event.target : this.source;
    if (isNode(target) && !this.#doNotHandle(event)) {
      return target;
    }
  }

  #initialContext(event) {
    const target = this.#initialTarget(event);
    if (!target) return;

    return {
      trace: crypto.randomUUID(),
      event,
      initialTarget: target,
      targets: [target],
      signal: this.signal,
      ...isActionEvent(event) ? event.context : undefined,
      control: this,
      index: 0,
    };
  }

  execPipeline(event) {
    const context = this.#initialContext(event);
    return context ? execPipeline(context) : Promise.resolve();
  }

  handleEvent(event) {
    const resultPromise = this.execPipeline(event);

    if (isActionEvent(event)) {
      event.addResult(resultPromise);
    }
  }

  #isDetached() {
    const target = this.eventTarget;
    if (!target) return true;
    if (isDocument(target)) return false;
    if (isShadowRoot(target)) return !target.host;
    if (isNode(target)) return !target.parentNode;
    return false;
  }

  isDead() {
    return !this.root || !this.source || !this.actions.length ||
      this.#isDetached();
  }

  toString() {
    this.#pipelineStr ??= stringifyPipeline(this.actions);
    return this.#pipelineStr;
  }

  get signal() {
    return this.#abortController.signal;
  }

    abort(reason) {
    this.#abortController.abort(reason);
  }

  #addAbortController() {
    this.#abortController = new AbortController();
    this.#abortController.signal.addEventListener("abort", () => {
      this.#addAbortController();
    }, { once: true });
  }
}
