var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// lib/ready.ts
var isReady = false;
document.addEventListener("DOMContentLoaded", function() {
  isReady = true;
}, { once: true, passive: true });
function ready(fn) {
  if (isReady) {
    fn(document);
  } else {
    document.addEventListener("DOMContentLoaded", () => fn(document), {
      once: true,
      passive: true
    });
  }
}

// lib/util/internal.ts
var values = /* @__PURE__ */ new Map();
var weakRefs = /* @__PURE__ */ new Set();
var toWeakRef = /* @__PURE__ */ new WeakMap();
function setInternal(obj, key, value) {
  if (!values.has(key)) {
    values.set(key, /* @__PURE__ */ new WeakMap());
  }
  values.get(key).set(obj, value);
  if (!toWeakRef.has(obj)) {
    const weakRef = new WeakRef(obj);
    weakRefs.add(weakRef);
    toWeakRef.set(obj, weakRef);
  }
}
function getInternal(obj, key, initializer) {
  if (initializer && !hasInternal(obj, key)) {
    setInternal(obj, key, initializer());
  }
  return values.get(key)?.get(obj);
}
function hasInternal(obj, key) {
  return !!values.get(key)?.has(obj);
}
function deleteInternal(obj, key) {
  if (key) {
    values.get(key)?.delete(obj);
  } else {
    for (const valueMap of values.values()) {
      valueMap.delete(obj);
    }
    const weakRef = toWeakRef.get(obj);
    if (weakRef) {
      weakRefs.delete(weakRef);
      toWeakRef.delete(obj);
    }
  }
}
function* objectsWithInternal(key) {
  const valueMap = values.get(key);
  if (valueMap) {
    for (const weakRef of weakRefs) {
      const obj = weakRef.deref();
      if (obj && valueMap.has(obj)) {
        yield [obj, valueMap.get(obj)];
      }
    }
  }
}
function* internalEntries() {
  for (const weakRef of weakRefs) {
    const obj = weakRef.deref();
    if (obj) {
      for (const [key, valueMap] of values.entries()) {
        if (valueMap.has(obj)) {
          yield [obj, key, valueMap.get(obj)];
        }
      }
    }
  }
}

// lib/config.ts
var config = {
  prefix: "ahx",
  httpMethods: [
    "get",
    "post",
    "put",
    "patch",
    "delete"
  ],
  ahxAttrs: [
    "trigger",
    "target"
  ],
  maxLoopCount: 10,
  defaultDelay: 20,
  defaultSettleDelay: 20,
  defaultSwapDelay: 0,
  enableDebugEvent: false,
  // parent tag -> default child pseudo tag (or null if a child is not permitted)
  pseudoChildTags: {
    "article": "div",
    "aside": "div",
    "audio": "track",
    "body": "div",
    "canvas": null,
    "colgroup": "col",
    "datalist": "option",
    "dl": "dt",
    "footer": "div",
    "form": "fieldset",
    "head": null,
    "header": "div",
    "hgroup": "div",
    "html": null,
    "iframe": null,
    "main": "div",
    "map": "area",
    "menu": "li",
    "noscript": null,
    "object": null,
    "ol": "li",
    "optgroup": "option",
    "picture": "source",
    "portal": null,
    "pre": null,
    "script": null,
    "section": "div",
    "select": "option",
    "style": null,
    "table": "tbody",
    "tbody": "tr",
    "template": null,
    "textarea": null,
    "tfoot": "tr",
    "thead": "tr",
    "tr": "td",
    "ul": "li",
    "video": "track",
    // void elements
    "area": null,
    "base": null,
    "br": null,
    "col": null,
    "embed": null,
    "hr": null,
    "img": null,
    "input": null,
    "link": null,
    "meta": null,
    "param": null,
    "source": null,
    "track": null,
    "wbr": null,
    // default for all other parents
    "*": "span"
  }
};

// lib/util/dispatch.ts
function dispatch(target, type, detail, cancelable = true) {
  if (target !== null) {
    const event = new CustomEvent(type, {
      bubbles: !!target,
      cancelable,
      detail
    });
    if (config.enableDebugEvent) {
      dispatchEvent(
        new CustomEvent(config.prefix, {
          bubbles: false,
          cancelable: false,
          detail: {
            type: event.type,
            target,
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            detail: event.detail
          }
        })
      );
    }
    return target && "dispatchEvent" in target ? target.dispatchEvent(event) : dispatchEvent(event);
  }
  return false;
}
function dispatchOneShot(target, name, detail) {
  dispatch(target, `${config.prefix}:${name}`, detail, false);
}
function dispatchBefore(target, name, detail) {
  detail._before = true;
  const permitted = dispatch(target, `${config.prefix}:${name}`, detail);
  delete detail._before;
  if (!permitted) {
    dispatch(target, `${config.prefix}:${name}:veto`, detail, false);
  }
  return permitted;
}
function dispatchAfter(target, name, detail) {
  detail._after = true;
  dispatch(target, `${config.prefix}:${name}:done`, detail, false);
  delete detail._after;
}
function dispatchError(target, name, detail) {
  dispatch(target, `${config.prefix}:${name}:error`, {
    error: name,
    ...detail
  }, false);
}

// lib/util/names.ts
function getAhxCSSPropertyNames(rule) {
  const names = /* @__PURE__ */ new Set();
  for (const name of rule.style) {
    if (isAhxCSSPropertyName(name)) {
      names.add(name);
    }
  }
  return names;
}
function hasAhxAttributes(elt) {
  for (const attr of elt.attributes) {
    if (isAhxAttributeName(attr.name)) {
      return true;
    }
  }
  return false;
}
function isAhxCSSPropertyName(name) {
  return name.startsWith(`--${config.prefix}-`);
}
function isAhxAttributeName(name) {
  return name.startsWith(`${config.prefix}-`);
}
function asAhxCSSPropertyName(name) {
  return isAhxCSSPropertyName(name) ? name : isAhxAttributeName(name) ? `--${name}` : `--${config.prefix}-${name}`;
}
function asAhxAttributeName(name) {
  return isAhxAttributeName(name) ? name : isAhxCSSPropertyName(name) ? name.substring(2) : `${config.prefix}-${name}`;
}

// lib/util/owner.ts
function getOwner(origin) {
  if (hasInternal(origin, "owner")) {
    return getInternal(origin, "owner");
  }
  if (origin instanceof StyleSheet) {
    return getInternal(origin, "owner") ?? origin.href ?? void 0;
  }
  if (origin instanceof CSSRule && origin.parentStyleSheet) {
    return getOwner(origin.parentStyleSheet);
  }
  if (origin instanceof Element && origin.parentElement) {
    return getOwner(origin.parentElement);
  }
}
function setOwner(origin, owner) {
  if (owner !== getOwner(origin)) {
    setInternal(origin, "owner", owner);
  }
}

// lib/parse_css_value.ts
function parseCssValue({ rule, style, prop, elt }) {
  style ??= rule?.style ?? (elt && getComputedStyle(elt));
  prop = asAhxCSSPropertyName(prop);
  const spec = {
    rule,
    style,
    prop,
    elt,
    value: style?.getPropertyValue(prop)?.trim(),
    important: style?.getPropertyPriority(prop) === "important"
  };
  if (spec.value) {
    if (elt) {
      const isAttr = /^attr\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(
        spec.value
      );
      if (isAttr) {
        spec.value = elt.getAttribute(isAttr[1]) ?? void 0;
        if (spec.value && isAttr[2] === "url") {
          spec.value = new URL(spec.value, elt.baseURI).href;
        }
        return spec;
      } else {
        const isProp = /^--prop\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(
          spec.value
        );
        if (isProp) {
          spec.value = void 0;
          const propValue = elt[isProp[1]];
          if (isProp[2] === "url" && typeof propValue === "string") {
            spec.value = new URL(propValue, elt.baseURI).href;
          } else if (typeof propValue === "string" || typeof propValue === "number" || typeof propValue === "boolean") {
            spec.value = String(propValue);
          }
          return spec;
        }
      }
    }
    const isURL = /^url\(([^\)]*)\)$/.exec(spec.value);
    if (isURL) {
      spec.value = isURL[1];
    }
    spec.value = parseQuoted(spec.value);
    if (isURL) {
      const baseURL = rule?.parentStyleSheet?.href ?? style?.parentRule?.parentStyleSheet?.href ?? elt?.baseURI;
      try {
        spec.value = new URL(spec.value, baseURL).href;
      } catch (e) {
        console.error(e, spec.value, baseURL);
      }
      return spec;
    }
    spec.tokens = spec.value.split(/\s+/).map(parseQuoted);
  }
  return spec;
}
function parseQuoted(value) {
  const isQuoted = /^\"([^\"]*)\"$/.exec(value) ?? /^\'([^\']*)\'$/.exec(value);
  if (isQuoted) {
    return isQuoted[1];
  }
  return value;
}

// lib/parse_attr_value.ts
function parseAttrValue(origin, prop) {
  if (origin instanceof Element) {
    prop = asAhxAttributeName(prop);
    const value = origin.getAttribute(prop) ?? void 0;
    return {
      prop,
      elt: origin,
      value,
      tokens: value?.split(/\s+/)
    };
  } else {
    return parseCssValue({ rule: origin, prop });
  }
}

// lib/util/query_selector.ts
function querySelectorExt(elt, query) {
  return _query(elt, query, false);
}
function _query(elt, query, all) {
  if (!query) {
    return single();
  }
  const [axis, selector] = splitQuery(query);
  switch (axis) {
    case "this":
      return single(elt);
    case "closest":
      return single(elt.closest(selector));
    case "find":
      return all ? elt.querySelectorAll(selector) : elt.querySelector(selector) ?? void 0;
    case "next":
      return single(next(elt, selector));
    case "previous":
      return single(previous(elt, selector));
    case "body":
      return single(elt.ownerDocument.body);
    case "document":
    case "window":
      return single();
    default:
      return all ? elt.ownerDocument.querySelectorAll(query) : elt.ownerDocument.querySelector(query) ?? void 0;
  }
  function single(found) {
    return all ? found ? [found] : [] : found ?? void 0;
  }
}
function splitQuery(query) {
  const spaceIndex = query.indexOf(" ");
  if (spaceIndex === -1) {
    return [query, ""];
  } else {
    return [query.substring(0, spaceIndex), query.substring(spaceIndex + 1)];
  }
}
function next(start, selector) {
  for (const elt of start.ownerDocument.querySelectorAll(selector)) {
    if (elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_PRECEDING) {
      return elt;
    }
  }
}
function previous(start, selector) {
  const results = start.ownerDocument.querySelectorAll(selector);
  for (let i = results.length - 1; i >= 0; i--) {
    const elt = results[i];
    if (elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_FOLLOWING) {
      return elt;
    }
  }
}

// ext/polyfill/ReadableStream_asyncIterator.js
async function* readableStreamIterator() {
  const reader = this.getReader();
  try {
    let done, value;
    do {
      ({ done, value } = await reader.read());
      if (value !== void 0) {
        yield value;
      }
    } while (!done);
  } finally {
    reader.releaseLock();
  }
}
ReadableStream.prototype[Symbol.asyncIterator] ??= readableStreamIterator;

// ext/HTMLBodyElementParserStream.js
var HTMLBodyElementParserStream = class extends TransformStream {
  /**
   * @param {Document} document will own the emitted elements
   */
  constructor(document2) {
    let parser;
    super({
      start() {
        parser = document2.implementation.createHTMLDocument();
      },
      transform(chunk, controller) {
        parser.write(chunk);
        while (parser.body.childElementCount > 1) {
          const element = parser.body.children[0];
          document2.adoptNode(element);
          controller.enqueue(element);
        }
      },
      flush(controller) {
        for (const element of [...parser.body.children]) {
          document2.adoptNode(element);
          controller.enqueue(element);
        }
        parser.close();
        parser = void 0;
      }
    });
  }
};

// lib/swap_html.ts
async function swapHtml(props) {
  const { response, target } = props;
  if (response?.ok && response.headers.get("Content-Type")?.startsWith("text/html") && response.body) {
    let index = 0;
    let previous2;
    const elements2 = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new HTMLBodyElementParserStream(document));
    for await (const element of elements2) {
      const detail = {
        ...props,
        swapStyle: props.swapStyle ?? "outerhtml",
        element,
        previous: previous2,
        index
      };
      if (dispatchBefore(target, "swap", detail)) {
        const { element: element2, originOwner, swapStyle } = detail;
        if (originOwner) {
          setOwner(element2, originOwner);
        }
        if (!previous2) {
          swapHandlers[swapStyle]?.(target, element2);
        } else {
          previous2.after(element2);
        }
        previous2 = element2;
        dispatchAfter(target, "swap", detail);
      }
      index++;
    }
  }
}
var swapAdjacent = (pos) => (target, element) => {
  target.insertAdjacentElement(pos, element);
};
var swapHandlers = {
  innerhtml(target, element) {
    target.replaceChildren(element);
  },
  outerhtml(target, element) {
    target.replaceWith(element);
  },
  beforebegin: swapAdjacent("beforebegin"),
  afterbegin: swapAdjacent("afterbegin"),
  beforeend: swapAdjacent("beforeend"),
  afterend: swapAdjacent("afterend")
};

// lib/swap_attr.ts
function swapAttr(props) {
  const { target, itemName, merge } = props;
  const detail = {
    ...props
  };
  detail.oldValue = target.getAttribute(itemName) ?? void 0;
  if (merge === "join" && detail.oldValue && detail.value) {
    detail.value = join(detail.oldValue, detail.value);
  }
  if (dispatchBefore(target, "swap", detail)) {
    const { target: target2, itemName: itemName2, value } = detail;
    if (itemName2 && value !== void 0) {
      target2.setAttribute(itemName2, value);
    }
    dispatchAfter(target2, "swap", detail);
  }
}
function join(oldValue, newValue) {
  const sep = " ";
  const values2 = new Set(`${oldValue}${sep}${newValue}`.split(sep));
  values2.delete("");
  return [...values2].join(sep);
}

// lib/swap_input.ts
function swapInput(props) {
  const { target, itemName, merge, value } = props;
  if (!itemName || value === void 0) {
    return;
  }
  const detail = {
    ...props
  };
  if (target instanceof HTMLFormElement) {
    detail.input = target.elements.namedItem(itemName) ?? void 0;
    switch (merge) {
      case "append":
        detail.input = createInput(itemName, target.ownerDocument);
        break;
      default:
        if (!detail.input) {
          detail.input = createInput(itemName, target.ownerDocument);
        } else if ("value" in detail.input) {
          detail.oldValue = detail.input.value;
        }
        break;
    }
  } else {
    detail.formData = getInternal(target, "formData", () => new FormData());
    const oldValue = detail.formData.get(itemName);
    if (typeof oldValue === "string") {
      detail.oldValue = oldValue;
    }
  }
  if (merge === "join") {
    detail.value = join2(detail.oldValue, detail.value);
  }
  if (dispatchBefore(target, "swap", detail)) {
    const { target: target2, input, itemName: itemName2, merge: merge2, formData, value: value2 } = detail;
    if (itemName2 && value2 !== void 0) {
      if (input && "value" in input) {
        input.value = value2;
        if (input instanceof Element && !input.parentElement) {
          target2.insertAdjacentElement("beforeend", input);
        }
      } else if (formData) {
        if (merge2 === "append") {
          formData.append(itemName2, value2);
        } else {
          formData.set(itemName2, value2);
        }
      }
    }
    dispatchAfter(target2, "swap", detail);
  }
}
function createInput(name, document2) {
  const input = document2.createElement("input");
  input.type = "hidden";
  input.name = name;
  return input;
}
function join2(oldValue = "", newValue = "") {
  const sep = " ";
  const values2 = new Set(`${oldValue}${sep}${newValue}`.split(sep));
  values2.delete("");
  return [...values2].join(sep);
}

// lib/swap_text.ts
function swapText(props) {
  const { swapStyle } = props;
  switch (swapStyle) {
    case "input":
      return swapInput(props);
    case "attr":
      return swapAttr(props);
  }
}

// lib/handle_swap.ts
async function handleSwap(props) {
  const { swapStyle, response, itemName } = props;
  let { value } = props;
  switch (swapStyle) {
    case "none":
      return swapNone(props);
    case "input":
    case "attr": {
      if (!itemName) {
        return;
      }
      if (value === void 0 && response) {
        value = await response.text();
      }
      return swapText({
        ...props,
        swapStyle,
        itemName,
        value
      });
    }
    default:
      if (isHtmlResponse(response)) {
        return swapHtml({
          ...props,
          swapStyle: swapStyle ?? "outerhtml",
          response
        });
      }
  }
}
function swapNone(_props) {
}
function isHtmlResponse(response) {
  return !!response?.headers.get("Content-Type")?.startsWith("text/html") && !!response.body;
}

// lib/handle_request.ts
async function handleRequest(props) {
  const { source, action, target, swap, formData, originOwner, targetOwner } = props;
  if (action.type !== "request") {
    return;
  }
  const detail = {
    request: prepareRequest(action, formData)
  };
  if (dispatchBefore(source, "request", detail)) {
    const { request } = detail;
    try {
      const response = await fetch(request);
      dispatchAfter(source, "request", { request, response });
      await handleSwap({
        ...swap,
        target,
        response,
        originOwner,
        targetOwner
      });
    } catch (error) {
      dispatchAfter(source, "request", { request, error });
    }
  }
}
function prepareRequest(action, formData) {
  const url = new URL(action.url);
  const init = {
    method: action.method.toUpperCase()
  };
  if (formData) {
    switch (init.method) {
      case "GET":
      case "HEAD":
      case "DELETE":
        for (const [key, value] of formData) {
          url.searchParams.append(key, String(value));
        }
        break;
      case "PUT":
      case "POST":
      case "PATCH":
        init.body = formData;
    }
  }
  return new Request(url, init);
}

// lib/handle_harvest.ts
async function handleHarvest(props) {
  const {
    event,
    source,
    action,
    target,
    swap,
    origin,
    originOwner,
    targetOwner
  } = props;
  if (!(origin instanceof CSSStyleRule) || action.type !== "harvest") {
    return;
  }
  const newValue = parseCssValue({ elt: source, rule: origin, prop: "harvest" }).value;
  if (newValue === void 0) {
    return;
  }
  const oldValue = getOldValue(event);
  const detail = {
    source,
    oldValue,
    newValue,
    origin,
    targetOwner,
    originOwner
  };
  if (dispatchBefore(source, "harvest", detail)) {
    await handleSwap({
      ...swap,
      target,
      value: detail.newValue
    });
    dispatchAfter(source, "harvest", detail);
  }
}
function getOldValue(event) {
  if (event instanceof CustomEvent && "oldValue" in event.detail) {
    return event.detail.oldValue;
  }
}

// lib/handle_action.ts
async function handleAction(detail) {
  const { source, origin } = detail;
  const query = parseAttrValue(origin, "include").value;
  const include = querySelectorExt(source, query);
  detail.formData = include ? getFormData(include) : void 0;
  if (dispatchBefore(source, "handleAction", detail)) {
    switch (detail.action.type) {
      case "request":
        await handleRequest(detail);
        break;
      case "harvest":
        await handleHarvest(detail);
        break;
    }
    dispatchAfter(source, "handleAction", detail);
  }
}
function getFormData(elt) {
  if (hasInternal(elt, "formData")) {
    return getInternal(elt, "formData");
  }
  if (elt instanceof HTMLFormElement) {
    return new FormData(elt);
  }
}

// lib/handle_trigger.ts
function handleTrigger(detail) {
  const { trigger, source } = detail;
  if (isDenied(source)) {
    dispatchError(source, "triggerDenied", detail);
    return;
  }
  if (dispatchBefore(source, "handleTrigger", detail)) {
    if (trigger?.once) {
      if (hasInternal(source, "triggeredOnce")) {
        return;
      } else {
        setInternal(source, "triggeredOnce", true);
      }
    }
    if (trigger?.changed) {
    }
    if (hasInternal(source, "delayed")) {
      clearTimeout(getInternal(source, "delayed"));
      deleteInternal(source, "delayed");
    }
    if (trigger?.throttle) {
    } else if (trigger?.delay) {
    } else {
      handleAction(detail);
    }
    dispatchAfter(source, "handleTrigger", detail);
  }
}
function isDenied(elt) {
  return parseAttrValue(elt, "deny-trigger").value === "true";
}

// lib/util/resolve_element.ts
function resolveElement(origin) {
  if (origin instanceof Element) {
    return origin;
  }
  if (origin && "ownerNode" in origin && origin.ownerNode && origin.ownerNode instanceof Element) {
    return origin.ownerNode;
  }
  if (origin?.parentStyleSheet) {
    return resolveElement(origin.parentStyleSheet);
  }
  if (origin && "ownerRule" in origin) {
    return resolveElement(origin.ownerRule);
  }
}

// lib/util/event.ts
var AHX_EVENTS = /* @__PURE__ */ new Set(["load", "watch"]);
function toDOMEventType(type) {
  if (AHX_EVENTS.has(type)) {
    return `${config.prefix}:${type}`;
  }
  return type;
}
function fromDOMEventType(type) {
  const prefix = `${config.prefix}:`;
  if (type.startsWith(prefix)) {
    return type.substring(prefix.length);
  }
  return type;
}

// lib/util/rules.ts
function* getTriggerRulesByEvent(type) {
  for (const [rule, trigger] of objectsWithInternal(`trigger:${type}`)) {
    if (trigger && rule instanceof CSSStyleRule && isRuleEnabled(rule)) {
      yield [rule, trigger];
    }
  }
}
function* getTriggerElementsByEvent(type) {
  for (const [elt, trigger] of objectsWithInternal(`trigger:${type}`)) {
    if (elt instanceof Element) {
      yield [elt, trigger];
    }
  }
}
function* getTriggerRulesByAction(type) {
  for (const [rule, key, trigger] of internalEntries()) {
    if (key.startsWith("trigger:") && rule instanceof CSSStyleRule && typeof trigger === "object" && "action" in trigger && trigger.action.type === type && isRuleEnabled(rule)) {
      yield [rule, trigger];
    }
  }
}
function isRuleEnabled(rule) {
  return !!rule.parentStyleSheet && !rule.parentStyleSheet.disabled;
}

// lib/triggers.ts
var eventTypes = /* @__PURE__ */ new Set();
function addTriggers(origin, triggers2, actions, swap) {
  for (const trigger of triggers2) {
    for (const action of actions) {
      addTrigger(origin, trigger, action, swap);
    }
  }
}
function addTrigger(origin, trigger, action, swap) {
  const detail = {
    origin,
    trigger,
    action,
    swap
  };
  const target = resolveElement(origin) ?? document;
  if (dispatchBefore(target, "addTrigger", detail)) {
    const { trigger: trigger2, action: action2 } = detail;
    const { eventType } = trigger2;
    setInternal(origin, `trigger:${eventType}`, { trigger: trigger2, action: action2, swap });
    if (!eventTypes.has(eventType)) {
      const detail2 = { eventType };
      if (dispatchBefore(document, "addEventType", detail2)) {
        eventTypes.add(eventType);
        document.addEventListener(toDOMEventType(eventType), eventListener);
        dispatchAfter(document, "addEventType", detail2);
      }
    }
    dispatchAfter(target, "addTrigger", detail);
  }
}
function* getTriggersForEvent(event) {
  if (event.target instanceof Element) {
    const eventType = fromDOMEventType(event.type);
    const source = event.target;
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;
    const found = [];
    const trigger = getInternal(source, `trigger:${eventType}`);
    if (trigger) {
      found.push([source, trigger]);
    }
    if (recursive) {
      for (const [elt, trigger2] of getTriggerElementsByEvent(eventType)) {
        if (source.compareDocumentPosition(elt) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
          found.push([elt, trigger2]);
        }
      }
    }
    for (const [source2, trigger2] of found) {
      const sourceOwner = getOwner(source2);
      const target = parseTarget(source2);
      const targetOwner = getOwner(target);
      yield {
        ...trigger2,
        event,
        source: source2,
        sourceOwner,
        target,
        targetOwner,
        origin: source2,
        originOwner: sourceOwner
      };
    }
    for (const [origin, trigger2] of getTriggerRulesByEvent(eventType)) {
      const found2 = [];
      if (source.matches(origin.selectorText)) {
        found2.push(source);
      }
      if (recursive) {
        found2.push(...source.querySelectorAll(origin.selectorText));
      }
      for (const source2 of found2) {
        const target = parseTarget(source2, origin);
        yield {
          ...trigger2,
          event,
          source: source2,
          sourceOwner: getOwner(source2),
          target,
          targetOwner: getOwner(target),
          origin,
          originOwner: getOwner(origin)
        };
      }
    }
  }
}
function parseTarget(elt, rule) {
  const targetQuery = (rule ? parseCssValue({ elt, rule, prop: "target" }).value : parseAttrValue(elt, "target").value) || "this";
  return querySelectorExt(elt, targetQuery) ?? elt;
}
function eventListener(event) {
  for (const triggered of getTriggersForEvent(event)) {
    handleTrigger(triggered);
  }
}

// lib/parse_interval.ts
function parseInterval(str) {
  if (str == void 0) {
    return void 0;
  }
  if (str.slice(-2) == "ms") {
    return parseFloat(str.slice(0, -2)) || void 0;
  }
  if (str.slice(-1) == "s") {
    return parseFloat(str.slice(0, -1)) * 1e3 || void 0;
  }
  if (str.slice(-1) == "m") {
    return parseFloat(str.slice(0, -1)) * 1e3 * 60 || void 0;
  }
  return parseFloat(str) || void 0;
}

// lib/parse_triggers.ts
var WHITESPACE_OR_COMMA = /[\s,]/;
var SYMBOL_START = /[_$a-zA-Z]/;
var SYMBOL_CONT = /[_$a-zA-Z0-9]/;
var STRINGISH_START = ['"', "'", "/"];
var NOT_WHITESPACE = /[^\s]/;
var INPUT_SELECTOR = "input, textarea, select";
function parseTriggers(origin, triggerValue, defaultEventType = "click") {
  const triggerSpecs = [];
  const elt = origin instanceof Element ? origin : void 0;
  const target = resolveElement(origin) ?? document;
  if (triggerValue) {
    const tokens = tokenizeString(triggerValue);
    do {
      consumeUntil(tokens, NOT_WHITESPACE);
      const initialLength = tokens.length;
      const trigger = consumeUntil(tokens, /[,\[\s]/);
      if (trigger) {
        if (trigger === "every") {
          const every = { eventType: "every" };
          consumeUntil(tokens, NOT_WHITESPACE);
          every.pollInterval = parseInterval(consumeUntil(tokens, /[,\[\s]/));
          consumeUntil(tokens, NOT_WHITESPACE);
          triggerSpecs.push(every);
        } else {
          const triggerSpec = { eventType: trigger };
          while (tokens.length > 0 && tokens[0] !== ",") {
            consumeUntil(tokens, NOT_WHITESPACE);
            const token = tokens.shift();
            if (token === "changed") {
              triggerSpec.changed = true;
            } else if (token === "once") {
              triggerSpec.once = true;
            } else if (token === "delay" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.delay = parseInterval(
                consumeUntil(tokens, WHITESPACE_OR_COMMA)
              );
            } else if (token === "throttle" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.throttle = parseInterval(
                consumeUntil(tokens, WHITESPACE_OR_COMMA)
              );
            } else if (token === "queue" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.queue = consumeUntil(
                tokens,
                WHITESPACE_OR_COMMA
              );
            } else {
              dispatchError(target, "triggerSyntax", {
                token: tokens.shift()
              });
            }
          }
          triggerSpecs.push(triggerSpec);
        }
      }
      if (tokens.length === initialLength) {
        dispatchError(target, "triggerSyntax", {
          token: tokens.shift()
        });
      }
      consumeUntil(tokens, NOT_WHITESPACE);
    } while (tokens[0] === "," && tokens.shift());
  }
  if (triggerSpecs.length > 0) {
    return triggerSpecs;
  } else if (elt?.matches("form")) {
    return [{ eventType: "submit" }];
  } else if (elt?.matches('input[type="button"], input[type="submit"]')) {
    return [{ eventType: "click" }];
  } else if (elt?.matches(INPUT_SELECTOR)) {
    return [{ eventType: "change" }];
  } else {
    return [{ eventType: defaultEventType }];
  }
}
function tokenizeString(str) {
  const tokens = [];
  let position = 0;
  while (position < str.length) {
    if (SYMBOL_START.exec(str.charAt(position))) {
      const startPosition = position;
      while (SYMBOL_CONT.exec(str.charAt(position + 1))) {
        position++;
      }
      tokens.push(str.substr(startPosition, position - startPosition + 1));
    } else if (STRINGISH_START.indexOf(str.charAt(position)) !== -1) {
      const startChar = str.charAt(position);
      const startPosition = position;
      position++;
      while (position < str.length && str.charAt(position) !== startChar) {
        if (str.charAt(position) === "\\") {
          position++;
        }
        position++;
      }
      tokens.push(str.substr(startPosition, position - startPosition + 1));
    } else {
      const symbol = str.charAt(position);
      tokens.push(symbol);
    }
    position++;
  }
  return tokens;
}
function consumeUntil(tokens, match) {
  let result = "";
  while (tokens.length > 0 && !tokens[0].match(match)) {
    result += tokens.shift();
  }
  return result;
}

// lib/parse_actions.ts
function parseActions(origin) {
  const actionSpecs = [];
  for (const method of config.httpMethods) {
    const url = parseAttrValue(origin, method).value;
    if (url) {
      const baseURL = (resolveElement(origin) ?? document).baseURI;
      actionSpecs.push({
        type: "request",
        method,
        url: new URL(url, baseURL)
      });
    }
  }
  if (origin instanceof CSSStyleRule) {
    if (getAhxCSSPropertyNames(origin).has(asAhxCSSPropertyName("harvest"))) {
      actionSpecs.push({
        type: "harvest"
      });
    }
  }
  return actionSpecs;
}

// lib/parse_swap.ts
function parseSwap(origin) {
  const tokens = parseAttrValue(origin, "swap").tokens;
  const swapSpec = {};
  if (tokens?.length) {
    swapSpec.swapStyle = tokens.shift()?.toLowerCase();
    if (swapSpec.swapStyle === "attr" || swapSpec.swapStyle === "input") {
      swapSpec.itemName = tokens.shift();
    }
    for (const token of tokens) {
      const [modifier, value] = token.split(":");
      switch (modifier) {
        case "swap":
        case "delay":
          swapSpec.delay = parseInterval(value);
          break;
        case "join":
          swapSpec.merge = "join";
          break;
        case "append":
          swapSpec.merge = "append";
          break;
      }
    }
  }
  return swapSpec;
}

// lib/process_triggers.ts
function processTriggers(origin, defaultEventType) {
  const triggerValue = parseAttrValue(origin, "trigger").value;
  const triggers2 = parseTriggers(origin, triggerValue, defaultEventType);
  const actions = parseActions(origin);
  const swap = parseSwap(origin);
  addTriggers(origin, triggers2, actions, swap);
}

// lib/process_element.ts
function processElement(elt) {
  if (hasAhxAttributes(elt)) {
    const detail = {
      owner: getOwner(elt)
    };
    if (dispatchBefore(elt, "processElement", detail)) {
      if (detail.owner) {
        setOwner(elt, detail.owner);
      }
      processTriggers(elt, "click");
      dispatchAfter(elt, "processElement", detail);
    }
  }
}

// lib/process_elements.ts
function processElements(root) {
  const selectors = /* @__PURE__ */ new Set();
  [...config.ahxAttrs, ...config.httpMethods].forEach((attr) => {
    selectors.add(`[${asAhxAttributeName(attr)}]`);
  });
  const detail = { selectors };
  if (dispatchBefore(root, "processElements", detail)) {
    const processed = /* @__PURE__ */ new Set();
    for (const selector of detail.selectors) {
      if (!processed.has(root) && root instanceof Element && root.matches(selector)) {
        processed.add(root);
        processElement(root);
      }
      for (const elt of root.querySelectorAll(selector)) {
        if (!processed.has(elt)) {
          processed.add(elt);
          processElement(elt);
        }
      }
    }
    dispatchAfter(root, "processElements", detail);
  }
}

// lib/trigger_mutate.ts
function triggerMutate(elt) {
  dispatchOneShot(elt, "mutate", {});
}

// lib/trigger_load.ts
function triggerLoad(elt) {
  dispatchOneShot(elt, "load", { recursive: true });
}

// lib/process_guards.ts
function processGuards(rule, props) {
  const prop = asAhxCSSPropertyName("deny-trigger");
  if (props.has(prop)) {
    const { value } = parseCssValue({ rule, prop });
    if (value === "true") {
      setInternal(rule, "denyTrigger", true);
    } else {
      rule.style.removeProperty(prop);
      dispatchError(
        rule.parentStyleSheet?.ownerNode ?? document,
        "invalidCssValue",
        {
          prop,
          value,
          rule
        }
      );
    }
  }
  return [];
}

// lib/process_pseudo_elements.ts
var nextPseudoId = 1;
function processPseudoElements(rule) {
  const before = rule.selectorText.includes("::before");
  const after = before ? false : rule.selectorText.includes("::after");
  if (before || after) {
    const pseudoId = getInternal(rule, "pseudoId") || nextPseudoId++;
    const place = before ? "before" : "after";
    const parentSelector = rule.selectorText.replace(`::${place}`, "");
    for (const elt of document.querySelectorAll(parentSelector)) {
      createPseudoElement(elt, pseudoId, place);
    }
    return createPseudoRule(rule, pseudoId, place);
  }
}
function createPseudoElement(elt, pseudoId, place) {
  const pseudoIdClass = `${config.prefix}-pseudo-${pseudoId}`;
  if (!elt.querySelector(`:scope > .${pseudoIdClass}`)) {
    const parentTag = elt.localName;
    let pseudoTag = config.pseudoChildTags[parentTag];
    if (pseudoTag === null) {
      dispatchError(elt, "pseudoElementNotPermitted", { parentTag });
      return;
    }
    if (pseudoTag === void 0) {
      pseudoTag = config.pseudoChildTags["*"] ?? "span";
    }
    const placeClass = `${config.prefix}-pseudo-${place}`;
    const pseudoElt = document.createElement(pseudoTag);
    pseudoElt.setAttribute(
      "class",
      `${config.prefix}-pseudo ${placeClass} ${pseudoIdClass}`
    );
    const detail = {
      pseudoElt,
      pseudoId,
      place
    };
    if (dispatchBefore(elt, "pseudoElement", detail)) {
      const insertPosition = detail.place === "before" ? "afterbegin" : "beforeend";
      elt.insertAdjacentElement(insertPosition, detail.pseudoElt);
      dispatchAfter(elt, "pseudoElement", detail);
    }
  }
}
function createPseudoRule(rule, pseudoId, place) {
  if (!hasInternal(rule, "pseudoId")) {
    setInternal(rule, "pseudoId", pseudoId);
    const pseudoIdClass = `${config.prefix}-pseudo-${pseudoId}`;
    const selectorText = rule.selectorText.replace(
      `::${place}`,
      ` > .${pseudoIdClass}`
    );
    const cssText = rule.cssText.replace(rule.selectorText, selectorText);
    const pseudoRule = {
      selectorText,
      cssText,
      parentStyleSheet: rule.parentStyleSheet
    };
    const detail = {
      pseudoId,
      pseudoRule,
      rule,
      place,
      owner: getOwner(rule)
    };
    const target = resolveElement(rule) ?? document;
    if (dispatchBefore(target, "pseudoRule", detail)) {
      const styleSheet = detail.pseudoRule.parentStyleSheet;
      if (styleSheet) {
        const cssRules = styleSheet.cssRules;
        const pseudoRule2 = cssRules[styleSheet.insertRule(detail.pseudoRule.cssText, cssRules.length)];
        if (!detail.owner && styleSheet.href) {
          detail.owner = styleSheet.href;
        }
        if (detail.owner) {
          setOwner(pseudoRule2, detail.owner);
        }
        dispatchAfter(target, "pseudoRule", {
          ...detail,
          pseudoRule: pseudoRule2
        });
        return pseudoRule2;
      }
    }
  }
}

// lib/process_css_imports.ts
function processCssImports(rule, props, onReady) {
  const importProp = asAhxCSSPropertyName("import");
  for (const prop of props) {
    if (prop === importProp || prop.startsWith(`${importProp}-`)) {
      let link = getInternal(rule, "importLinks")?.get(prop)?.deref();
      let ruleApplies = false;
      for (const elt of document.querySelectorAll(rule.selectorText)) {
        const url = parseCssValue({ rule, prop, elt }).value;
        if (url) {
          ruleApplies = true;
          if (link) {
            if (link.sheet && link.sheet.disabled) {
              link.sheet.disabled = false;
              setTimeout(() => {
                onReady?.(link);
              }, 0);
            }
            break;
          } else {
            link = createStyleSheetLink(
              url,
              resolveElement(rule)?.crossOrigin ?? void 0,
              onReady
            );
            if (link) {
              getInternal(rule, "importLinks", () => /* @__PURE__ */ new Map()).set(
                prop,
                new WeakRef(link)
              );
              break;
            }
          }
        }
      }
      if (!ruleApplies && link && link.sheet && !link.sheet.disabled) {
        link.sheet.disabled = true;
      }
    }
  }
}
function createStyleSheetLink(url, crossOrigin, onReady) {
  const detail = { url, crossOrigin, disabled: false };
  if (dispatchBefore(document, "cssImport", detail)) {
    if (!document.querySelector(`link[rel="stylesheet"][href="${detail.url}"]`)) {
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", detail.url);
      if (typeof detail.crossOrigin === "string") {
        link.setAttribute("crossorigin", detail.crossOrigin);
      }
      link.addEventListener("load", (event) => {
        console.log("After load", detail.url, link.sheet);
        function process(delay = 1) {
          setTimeout(() => {
            console.log("After load + timeout", detail.url, link.sheet);
            if (link.sheet) {
              dispatchAfter(event.target ?? document, "cssImport", detail);
              onReady?.(link);
            } else if (delay < 1e3) {
              process(delay * 2);
            } else {
              console.error("TIMEOUT");
            }
          }, delay);
        }
        process();
      }, { once: true, passive: true });
      document.head.appendChild(link);
      return link;
    }
  }
}

// lib/process_rule.ts
function processRule(rule, props) {
  if (rule.parentStyleSheet) {
    processStyleSheet(rule.parentStyleSheet);
  }
  if (props.size) {
    const owner = getOwner(rule);
    const detail = { rule, props, owner };
    const target = resolveElement(rule) ?? document;
    if (dispatchBefore(target, "processRule", detail)) {
      if (detail.owner) {
        setOwner(rule, detail.owner);
      }
      processCssImports(rule, props, processImportedRules);
      processGuards(rule, props);
      const pseudoRule = processPseudoElements(rule);
      if (pseudoRule) {
        processRule(pseudoRule, getAhxCSSPropertyNames(pseudoRule));
      }
      processTriggers(rule, "default");
      dispatchAfter(target, "processRule", detail);
    }
  }
}
function processStyleSheet(stylesheet) {
  if (!hasInternal(stylesheet, "owner")) {
    setOwner(stylesheet, stylesheet.href ?? "unknown");
  }
}
function processImportedRules(link) {
  processRules(link);
  triggerLoad(link.ownerDocument.documentElement);
}

// lib/process_rules.ts
function processRules(root) {
  const detail = {
    rules: findRules(root)
  };
  if (dispatchBefore(root, "processRules", detail)) {
    for (const [rule, props] of detail.rules) {
      processRule(rule, props);
    }
    dispatchAfter(root, "processRules", detail);
  }
}
function findRules(root) {
  const rules = /* @__PURE__ */ new Map();
  function fromStylesheet(stylesheet) {
    if (!stylesheet.disabled) {
      try {
        fromRuleList(stylesheet.cssRules);
      } catch {
      }
    }
  }
  function fromRuleList(rules2) {
    for (const rule of rules2) {
      if (rule instanceof CSSImportRule && rule.styleSheet) {
        fromStylesheet(rule.styleSheet);
      } else if (rule instanceof CSSGroupingRule) {
        fromRuleList(rule.cssRules);
      } else if (rule instanceof CSSStyleRule) {
        fromStyleRule(rule);
      }
    }
  }
  function fromStyleRule(rule) {
    const props = getAhxCSSPropertyNames(rule);
    if (props.size > 0) {
      rules.set(rule, props);
    }
  }
  if ("sheet" in root && root.sheet) {
    fromStylesheet(root.sheet);
  } else if ("styleSheets" in root) {
    for (const stylesheet of root.styleSheets) {
      fromStylesheet(stylesheet);
    }
  }
  return rules;
}

// lib/start_observer.ts
function startObserver(root) {
  const observer = new MutationObserver((mutations) => {
    const detail = { mutations };
    if (dispatchBefore(root, "mutations", detail)) {
      const removedNodes = /* @__PURE__ */ new Set();
      const removedElements = /* @__PURE__ */ new Set();
      const addedElements = /* @__PURE__ */ new Set();
      const mutatedElements = /* @__PURE__ */ new Set();
      for (const mutation of detail.mutations) {
        for (const node of mutation.removedNodes) {
          removedNodes.add(node);
          if (node instanceof Element) {
            removedElements.add(node);
          }
        }
        for (const node of mutation.addedNodes) {
          removedNodes.delete(node);
          if (node instanceof Element) {
            processElements(node);
            addedElements.add(node);
          }
        }
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          processElement(mutation.target);
        }
        if (mutation.target instanceof Element) {
          mutatedElements.add(mutation.target);
        }
      }
      setTimeout(() => {
        for (const elt of mutatedElements) {
          triggerMutate(elt);
        }
      }, 0);
      setTimeout(() => {
        for (const elt of addedElements) {
          triggerLoad(elt);
        }
      });
      processRules(root);
      dispatchAfter(root, "mutations", {
        ...detail,
        removedElements,
        addedElements,
        mutatedElements
      });
      for (const node of removedNodes) {
        deleteInternal(node);
      }
    }
  });
  const options = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true
  };
  if (dispatchBefore(root, "startObserver", options)) {
    observer.observe(root, options);
    dispatchAfter(root, "startObserver", options);
  }
}

// lib/debug/events.ts
var loggerConfig = {
  group: false,
  include: []
};
function eventsAll() {
  config.enableDebugEvent = true;
  addEventListener(config.prefix, logger);
}
function eventsNone() {
  config.enableDebugEvent = false;
  removeEventListener(config.prefix, logger);
}
function logger({ detail: event }) {
  const { type, target, detail } = event;
  if (shouldLog(type)) {
    if (detail?._after && loggerConfig.group) {
      console.groupEnd();
    }
    if (detail?._before) {
      const method = loggerConfig.group ? loggerConfig.group === true ? "group" : "groupCollapsed" : "debug";
      console[method]("%s -> %o %o", type, target, detail);
    } else {
      console.debug("%s -> %o %o", type, target, detail);
    }
  }
}
function shouldLog(type) {
  if (loggerConfig.include?.length) {
    if (loggerConfig.include.some((v) => type.includes(`:${v}`))) {
      return true;
    }
    return false;
  }
  return true;
}

// lib/debug.ts
var debug_exports = {};
__export(debug_exports, {
  elements: () => elements,
  eventsAll: () => eventsAll,
  eventsNone: () => eventsNone,
  forms: () => forms,
  internals: () => internals,
  logger: () => logger,
  loggerConfig: () => loggerConfig,
  owners: () => owners,
  triggers: () => triggers
});

// lib/debug/internals.ts
function internals() {
  console.group("AHX Internal Properties");
  let groupObject;
  for (const [object, key, value] of internalEntries()) {
    if (object !== groupObject) {
      if (groupObject) {
        console.groupEnd();
      }
      const representation = object instanceof CSSRule ? object.cssText : object;
      console.groupCollapsed(representation);
      console.dir(object);
      if (object instanceof CSSStyleRule) {
        for (const node of document.querySelectorAll(object.selectorText)) {
          console.log(node);
        }
      }
      groupObject = object;
    }
    if (value instanceof Map) {
      console.group("%s:", key);
      for (const entry of value) {
        console.log("%c%s:", "font-weight: bold", ...entry);
      }
      console.groupEnd();
    } else {
      console.log("%c%s:", "font-weight: bold", key, value);
    }
  }
  console.groupEnd();
}

// lib/debug/compare_position.ts
function comparePosition(a, b) {
  if (a === b) {
    return 0;
  }
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return -1;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
    return 1;
  } else {
    return 0;
  }
}

// lib/debug/elements.ts
function elements(ahxProp) {
  console.group("AHX Elements");
  const elements2 = /* @__PURE__ */ new Set();
  const rules = /* @__PURE__ */ new Set();
  for (const [object] of internalEntries()) {
    if (object instanceof Element) {
      elements2.add(object);
    } else if (object instanceof CSSStyleRule) {
      rules.add(object);
    }
  }
  for (const rule of rules) {
    for (const node of document.querySelectorAll(rule.selectorText)) {
      if (node instanceof Element) {
        elements2.add(node);
      }
    }
  }
  for (const elt of [...elements2].sort(comparePosition)) {
    if (ahxProp) {
      const { value } = parseAttrValue(elt, ahxProp);
      if (value) {
        console.log(elt, value);
      }
    } else {
      console.log(elt);
    }
  }
  console.groupEnd();
}

// lib/debug/triggers.ts
function triggers(verbose = false) {
  console.group("AHX Triggers");
  const elements2 = /* @__PURE__ */ new Map();
  function addOrigin(elt, origin, trigger) {
    if (!elements2.has(elt)) {
      elements2.set(elt, /* @__PURE__ */ new Map());
    }
    elements2.get(elt).set(trigger, origin);
  }
  for (const [origin, key, trigger] of internalEntries()) {
    if (key.startsWith("trigger:")) {
      if (origin instanceof Element) {
        addOrigin(origin, origin, trigger);
      } else if (origin instanceof CSSStyleRule) {
        for (const node of document.querySelectorAll(origin.selectorText)) {
          if (node instanceof Element) {
            addOrigin(node, origin, trigger);
          }
        }
      }
    }
  }
  const orderedElements = [...elements2.keys()].sort(comparePosition);
  for (const elt of orderedElements) {
    const triggers2 = elements2.get(elt) ?? [];
    const events = /* @__PURE__ */ new Set();
    const denied = isDenied(elt);
    for (const [{ trigger }] of triggers2) {
      events.add(trigger.eventType);
    }
    console.groupCollapsed(
      "%o : %c%s",
      elt,
      denied ? "text-decoration: line-through; color: grey" : "color: red",
      [...events].join(", ")
    );
    for (const [{ trigger, action }, origin] of triggers2) {
      if (verbose) {
        console.log(
          "trigger:",
          trigger,
          "action:",
          action,
          "origin:",
          origin
        );
      } else {
        const originRep = origin instanceof Element ? "element" : origin.cssText;
        console.log(
          "%c%s%c -> %c%s %s%c from: %c%s%c",
          "color: red; font-weight: bold",
          trigger.eventType,
          "color: inherit; font-weight: normal",
          "color: green",
          action.method?.toUpperCase(),
          action.url,
          "color: inherit",
          "color: lightblue",
          originRep,
          "color: inherit"
        );
      }
    }
    console.groupEnd();
  }
  console.groupEnd();
}

// lib/debug/owners.ts
function owners() {
  console.group("AHX Ownership");
  const elements2 = /* @__PURE__ */ new Set();
  for (const [object, key, owner] of internalEntries()) {
    if (object instanceof Element) {
      elements2.add(object);
    } else if (key === "owner") {
      if (object instanceof CSSRule) {
        console.log("%o -> %s", object.cssText, owner);
      } else {
        console.log("%o -> %s", object, owner);
      }
    }
  }
  for (const elt of [...elements2].sort(comparePosition)) {
    const owner = getInternal(elt, "owner");
    console.log("%o -> %s", elt, owner ?? "none");
  }
  console.groupEnd();
}

// lib/debug/forms.ts
function forms() {
  console.group("AHX Forms");
  const elements2 = /* @__PURE__ */ new Set();
  for (const [elt] of objectsWithInternal("formData")) {
    if (elt instanceof Element) {
      elements2.add(elt);
    }
  }
  for (const [rule] of getTriggerRulesByAction("harvest")) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const targetQuery = parseCssValue({ elt, rule, prop: "target" }).value ?? "this";
      const target = querySelectorExt(elt, targetQuery);
      if (target) {
        elements2.add(target);
      }
    }
  }
  for (const elt of [...elements2].sort(comparePosition)) {
    const formData = elt instanceof HTMLFormElement ? new FormData(elt) : getInternal(elt, "formData");
    if (formData) {
      console.group(elt);
      for (const [name, value] of formData ?? []) {
        console.log("%s: %c%s", name, "font-weight: bold", value);
      }
      console.groupEnd();
    }
  }
  console.groupEnd();
}

// lib/url_attrs.ts
function applyUrlAttrs(elt, loc) {
  if (elt && elt.getAttribute(`${config.prefix}-url-href`) !== loc.href) {
    setAttr("href", loc.href);
    setAttr("host", loc.host);
    setAttr("path", loc.pathname);
    setAttr("search", loc.search);
    setAttr("hash", loc.hash);
  }
  function setAttr(prop, value) {
    const attr = `${config.prefix}-url-${prop}`;
    if (value) {
      elt.setAttribute(attr, value);
    } else {
      elt.removeAttribute(attr);
    }
  }
}
function initUrlAttrs(document2) {
  function listener() {
    applyUrlAttrs(document2.documentElement, document2.location);
  }
  [
    "DOMContentLoaded",
    "load",
    "hashchange",
    "popstate"
  ].forEach((event) => {
    addEventListener(event, listener);
  });
  listener();
}

// lib/ahx.ts
ready((document2) => {
  eventsAll();
  initUrlAttrs(document2);
  startObserver(document2);
  processRules(document2);
  processElements(document2);
  triggerLoad(document2.documentElement);
});
window.ahx = debug_exports;
