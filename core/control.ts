import type {
  Action,
  ActionContext,
  ActionDecl,
  Control,
  ControlDecl,
  ControlSource,
  FindRuleNodes,
  MatchRuleNode,
} from "@ahx/types";
import { parsePipeline, stringifyPipeline } from "./parse-pipeline.ts";
import { execPipeline } from "./exec-pipeline.ts";
import { isActionEvent } from "./action-event.ts";
import { createAction } from "./action.ts";

export async function createControl(decl: ControlDecl): Promise<Control> {
  const { root, pipelineStr } = decl;

  const actionDecls = parsePipeline(pipelineStr);
  const actions = Object.freeze(await createActions(actionDecls, root));

  return Object.freeze(new ControlImpl(decl, actions));
}

function createActions(
  decls: ActionDecl[],
  root: ParentNode,
): Promise<Action[]> {
  return Promise.all(decls.map((decl) => createAction(decl, root)));
}

class ControlImpl implements Control {
  #root: WeakRef<ParentNode>;
  #source: WeakRef<ControlSource>;
  #abortController!: AbortController;
  #pipelineStr?: string;
  #ruleNodes?: FindRuleNodes;
  #ruleApplies?: MatchRuleNode;

  isRule: boolean;
  eventType: string;
  actions: readonly Action[];

  constructor(
    decl: ControlDecl,
    actions: readonly Action[],
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

  get root(): ParentNode | undefined {
    return this.#root?.deref();
  }
  get source(): ControlSource | undefined {
    return this.#source?.deref();
  }
  get eventTarget(): EventTarget | undefined {
    const { root, source } = this;
    return this.isRule
      ? root
      : source instanceof EventTarget
      ? source
      : undefined;
  }

  nodes(): Iterable<Node> {
    return this.#ruleNodes
      ? this.#ruleNodes?.apply(this)
      : this.source instanceof Node
      ? [this.source]
      : [];
  }

  #doNotHandle(event: Event): boolean {
    return this.isDead() ||
      !(event.target instanceof Node) ||
      (isActionEvent(event) &&
        (event.eventPhase !== Event.AT_TARGET || event.context.break ||
          event.context.signal.aborted)) ||
      (this.isRule && !this.#ruleApplies?.call(this, event.target));
  }

  #initialTarget(event: Event): Node | undefined {
    const target = this.isRule ? event.target : this.source;
    if (target instanceof Node && !this.#doNotHandle(event)) {
      return target;
    }
  }

  handleEvent(event: Event): void {
    const target = this.#initialTarget(event);

    if (!target) return;

    const context: ActionContext = {
      trace: crypto.randomUUID(),
      event,
      targets: [target],
      signal: this.signal,
      ...isActionEvent(event) ? event.context : undefined,
      control: this,
      index: 0,
    };

    const resultPromise = execPipeline(context);

    if (isActionEvent(event)) {
      event.addResult(resultPromise);
    }
  }

  #isDetached(): boolean {
    const target = this.eventTarget;
    if (!target) return true;
    if (target instanceof Document) return false;
    if (target instanceof ShadowRoot) return !target.host;
    if (target instanceof Node) return !target.parentNode;
    return false;
  }

  isDead(): boolean {
    return !this.root || !this.source || !this.actions.length ||
      this.#isDetached();
  }

  toString() {
    this.#pipelineStr ??= stringifyPipeline(this.actions);
    return this.#pipelineStr;
  }

  get signal(): AbortSignal {
    return this.#abortController.signal;
  }

  // deno-lint-ignore no-explicit-any
  abort(reason?: any): void {
    this.#abortController.abort(reason);
  }

  #addAbortController(): void {
    this.#abortController = new AbortController();
    this.#abortController.signal.addEventListener("abort", () => {
      this.#addAbortController();
    }, { once: true });
  }
}
