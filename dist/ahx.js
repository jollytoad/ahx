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

// lib/internal.ts
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
    "trigger"
  ],
  maxLoopCount: 10,
  defaultDelay: 20,
  defaultSettleDelay: 20,
  defaultSwapDelay: 0,
  defaultSwapStyle: "outerhtml",
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

// lib/dispatch.ts
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

// lib/names.ts
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
  for (const attr2 of elt.attributes) {
    if (isAhxAttributeName(attr2.name)) {
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

// lib/owner.ts
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
    }
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
    const attrValue = origin.getAttribute(prop);
    const { rule, value, important } = parseCssValue({ elt: origin, prop });
    return {
      prop,
      elt: origin,
      value: important && value ? value : attrValue ?? value,
      rule: important || !attrValue ? rule : void 0,
      important: important || !attrValue ? important : void 0
    };
  } else {
    return parseCssValue({ rule: origin, prop });
  }
}

// lib/query_selector.ts
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

// lib/parse_swap.ts
function parseSwap(elt, swapInfoOverride) {
  const swapInfo = swapInfoOverride || parseAttrValue(elt, "swap").value;
  const swapSpec = {
    swapStyle: config.defaultSwapStyle,
    swapDelay: config.defaultSwapDelay,
    settleDelay: config.defaultSettleDelay
  };
  if (swapInfo) {
    const split = swapInfo.trim().split(/\s+/);
    if (split[0] && !split[0].includes(":")) {
      swapSpec.swapStyle = split[0].toLowerCase();
    }
    for (const token of split) {
      if (token.includes(":")) {
        const [modifier, value] = token.split(":");
        switch (modifier) {
          case "swap":
            swapSpec.swapDelay = parseInterval(value) ?? swapSpec.swapDelay;
            break;
          case "settle":
            swapSpec.settleDelay = parseInterval(value) ?? swapSpec.settleDelay;
            break;
        }
      }
    }
  }
  return swapSpec;
}

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

// lib/swap.ts
async function swap(target, response, owner) {
  if (response.ok && response.headers.get("Content-Type")?.startsWith("text/html") && response.body) {
    const swapSpec = parseSwap(target);
    let index = 0;
    let previous2;
    const elements2 = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new HTMLBodyElementParserStream(document));
    for await (const element of elements2) {
      const detail = {
        ...swapSpec,
        element,
        previous: previous2,
        index,
        owner
      };
      if (dispatchBefore(target, "swap", detail)) {
        const {
          element: element2,
          previous: _previous,
          index: _index,
          owner: owner2,
          ...swapSpec2
        } = detail;
        if (owner2) {
          setOwner(element2, owner2);
        }
        if (!previous2) {
          swapHandlers[swapSpec2.swapStyle]?.(target, element2, swapSpec2);
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
var swapAdjacent = (target, element, spec) => {
  target.insertAdjacentElement(spec.swapStyle, element);
};
var swapHandlers = {
  none: () => {
  },
  innerhtml(target, element) {
    target.replaceChildren(element);
  },
  outerhtml(target, element) {
    target.replaceWith(element);
  },
  beforebegin: swapAdjacent,
  afterbegin: swapAdjacent,
  beforeend: swapAdjacent,
  afterend: swapAdjacent
};

// lib/handle_request.ts
async function handleRequest(detail, formData) {
  const { target, action, originOwner } = detail;
  switch (action.type) {
    case "request": {
      const detail2 = {
        request: prepareRequest(action, formData)
      };
      if (dispatchBefore(target, "request", detail2)) {
        const { request } = detail2;
        try {
          const response = await fetch(request);
          dispatchAfter(target, "request", { request, response });
          await swap(target, response, originOwner);
        } catch (error) {
          dispatchAfter(target, "request", { request, error });
        }
      }
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

// lib/handle_action.ts
async function handleAction(triggered) {
  const { target } = triggered;
  const query = parseAttrValue(target, "include").value;
  const include = querySelectorExt(target, query);
  const formData = include ? getFormData(include) : void 0;
  const detail = {
    ...triggered,
    formData
  };
  if (dispatchBefore(target, "handleAction", detail)) {
    switch (detail.action.type) {
      case "request":
        await handleRequest(detail, formData);
        break;
    }
    dispatchAfter(target, "handleAction", triggered);
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
function handleTrigger(triggered) {
  const { trigger, target } = triggered;
  if (isDenied(target)) {
    dispatchError(target, "triggerDenied", triggered);
    return;
  }
  if (dispatchBefore(target, "handleTrigger", triggered)) {
    if (trigger.target) {
      if (!target.matches(trigger.target)) {
        return;
      }
    }
    if (trigger.once) {
      if (hasInternal(target, "triggeredOnce")) {
        return;
      } else {
        setInternal(target, "triggeredOnce", true);
      }
    }
    if (trigger.changed) {
    }
    if (hasInternal(target, "delayed")) {
      clearTimeout(getInternal(target, "delayed"));
      deleteInternal(target, "delayed");
    }
    if (trigger.throttle) {
    } else if (trigger.delay) {
    } else {
      handleAction(triggered);
    }
    dispatchAfter(target, "handleTrigger", triggered);
  }
}
function isDenied(elt) {
  return parseAttrValue(elt, "deny-trigger").value === "true";
}

// lib/resolve_element.ts
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

// lib/triggers.ts
var eventTypes = /* @__PURE__ */ new Set();
function addTriggers(origin, triggers2, actions) {
  for (const trigger of triggers2) {
    for (const action of actions) {
      addTrigger(origin, trigger, action);
    }
  }
}
function addTrigger(origin, trigger, action) {
  const detail = {
    origin,
    trigger,
    action
  };
  const target = resolveElement(origin) ?? document;
  if (dispatchBefore(target, "addTrigger", detail)) {
    const { trigger: trigger2, action: action2 } = detail;
    const { eventType } = trigger2;
    getInternal(origin, "triggers", () => /* @__PURE__ */ new Map()).set(eventType, { trigger: trigger2, action: action2 });
    if (!eventTypes.has(eventType)) {
      const detail2 = { eventType };
      if (dispatchBefore(document, "addEventType", detail2)) {
        eventTypes.add(eventType);
        document.addEventListener(eventType, eventListener);
        dispatchAfter(document, "addEventType", detail2);
      }
    }
    dispatchAfter(target, "addTrigger", detail);
  }
}
function* getTriggersForEvent(event) {
  if (event.target instanceof Element) {
    const target = event.target;
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;
    const trigger = getInternal(target, "triggers")?.get(event.type);
    if (trigger) {
      const targetOwner = getOwner(target);
      yield {
        ...trigger,
        target,
        targetOwner,
        origin: target,
        originOwner: targetOwner
      };
    }
    for (const [origin, triggers2] of objectsWithInternal("triggers")) {
      if (origin instanceof CSSStyleRule) {
        const trigger2 = triggers2.get(event.type);
        if (trigger2 && isEnabled(origin)) {
          if (trigger2 && target.matches(origin.selectorText)) {
            yield {
              ...trigger2,
              target,
              targetOwner: getOwner(target),
              origin,
              originOwner: getOwner(origin)
            };
          }
          if (recursive) {
            const found = target.querySelectorAll(origin.selectorText);
            for (const target2 of found) {
              yield {
                ...trigger2,
                target: target2,
                targetOwner: getOwner(target2),
                origin,
                originOwner: getOwner(origin)
              };
            }
          }
        }
      }
    }
  }
}
function eventListener(event) {
  for (const triggered of getTriggersForEvent(event)) {
    handleTrigger(triggered);
  }
}
function isEnabled(styleRule) {
  return !!styleRule.parentStyleSheet && !styleRule.parentStyleSheet.disabled;
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
            } else if (token === "from" && tokens[0] === ":") {
              tokens.shift();
              let from_arg = consumeUntil(tokens, WHITESPACE_OR_COMMA);
              if (from_arg === "closest" || from_arg === "find" || from_arg === "next" || from_arg === "previous") {
                tokens.shift();
                from_arg += " " + consumeUntil(
                  tokens,
                  WHITESPACE_OR_COMMA
                );
              }
              triggerSpec.from = from_arg;
            } else if (token === "target" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.target = consumeUntil(tokens, WHITESPACE_OR_COMMA);
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
  return actionSpecs;
}

// lib/process_triggers.ts
function processTriggers(origin, defaultEventType) {
  const triggerValue = parseAttrValue(origin, "trigger").value;
  const triggers2 = parseTriggers(origin, triggerValue, defaultEventType);
  const actions = parseActions(origin);
  addTriggers(origin, triggers2, actions);
}

// lib/get_value_rules.ts
function* getValueRules() {
  for (const [rule, isValueRule] of objectsWithInternal("isValueRule")) {
    if (rule instanceof CSSStyleRule && isValueRule) {
      yield rule;
    }
  }
}

// lib/parse_target.ts
var MODIFIERS = /* @__PURE__ */ new Set(
  ["replace", "append", "join"]
);
var TARGET_TYPES = ["input", "attr"];
function parseTarget(elt, rule) {
  const query = parseCssValue({ elt, rule, prop: "target" }).value || "this";
  const [type, name] = parseTargetTypeAndName(elt, rule);
  if (type && name) {
    const modifier = parseCssValue({ elt, rule, prop: "modifier" }).value;
    const separator = modifier === "join" ? parseCssValue({ elt, rule, prop: "separator" }).value || " " : void 0;
    return {
      query,
      type,
      name,
      modifier: isModifier(modifier) ? modifier : void 0,
      separator
    };
  }
}
function parseTargetTypeAndName(elt, rule) {
  for (const prop of TARGET_TYPES) {
    const { value } = parseCssValue({ elt, rule, prop });
    if (value) {
      return [prop, value];
    }
  }
  return [];
}
function isModifier(value) {
  return !!value && MODIFIERS.has(value);
}

// lib/apply_value.ts
function applyValue(detail) {
  const { prepare, perform } = handlers[detail.type];
  prepare(detail);
  if (dispatchBefore(detail.target, "applyValue", detail)) {
    perform(detail);
    dispatchAfter(detail.target, "applyValue", detail);
  }
}
var input = {
  prepare(detail) {
    const { target, name, modifier } = detail;
    if (target instanceof HTMLFormElement) {
      detail.input = target.elements.namedItem(name) ?? void 0;
      switch (modifier) {
        case "append":
          detail.input = createInput(name, target.ownerDocument);
          break;
        case "join":
        case "replace":
          if (!detail.input) {
            detail.input = createInput(name, target.ownerDocument);
          } else if ("value" in detail.input) {
            detail.oldValue = detail.input.value;
          }
          break;
      }
    } else {
      detail.formData = getInternal(target, "formData", () => new FormData());
      const oldValue = detail.formData.get(name);
      if (typeof oldValue === "string") {
        detail.oldValue = oldValue;
      }
    }
    if (modifier === "join") {
      detail.newValue = join(detail);
    }
  },
  perform(detail) {
    const { target, input: input2, name, modifier, formData, newValue } = detail;
    if (input2 && "value" in input2) {
      input2.value = newValue;
      if (input2 instanceof Element && !input2.parentElement) {
        target.insertAdjacentElement("beforeend", input2);
      }
    } else if (formData) {
      if (modifier === "append") {
        formData.append(name, newValue);
      } else {
        formData.set(name, newValue);
      }
    }
  }
};
var attr = {
  prepare(detail) {
    const { target, name, modifier } = detail;
    detail.oldValue = target.getAttribute(name) ?? void 0;
    if (modifier === "append" || modifier === "join") {
      detail.newValue = join(detail);
    }
  },
  perform({ target, name, newValue }) {
    target.setAttribute(name, newValue);
  }
};
var handlers = {
  input,
  attr
};
function createInput(name, document2) {
  const input2 = document2.createElement("input");
  input2.type = "hidden";
  input2.name = name;
  return input2;
}
function join(detail) {
  const { oldValue, newValue } = detail;
  const sep = detail.separator ?? " ";
  const values3 = new Set(`${oldValue ?? ""}${sep}${newValue ?? ""}`.split(sep));
  values3.delete("");
  return [...values3].join(sep);
}

// lib/apply_value_rule.ts
function applyValueRule(elt, rule) {
  const newValue = parseCssValue({ elt, rule, prop: "value" }).value;
  if (newValue) {
    const oldValue = getInternal(elt, "values", () => /* @__PURE__ */ new WeakMap()).get(rule);
    if (newValue !== oldValue) {
      const targetSpec = parseTarget(elt, rule);
      const target = querySelectorExt(elt, targetSpec?.query);
      const detail = {
        ...targetSpec,
        target,
        oldValue,
        newValue,
        sourceOwner: getOwner(elt),
        targetOwner: target ? getOwner(target) : void 0,
        ruleOwner: getOwner(rule)
      };
      if (dispatchBefore(elt, "applyValueRule", detail)) {
        getInternal(elt, "values", () => /* @__PURE__ */ new WeakMap()).set(
          rule,
          detail.newValue
        );
        if (hasTarget(detail)) {
          applyValue({ ...detail });
        }
        dispatchAfter(elt, "applyValueRule", detail);
      }
    }
  }
}
function hasTarget(detail) {
  return !!detail.query && !!detail.target && !!detail.type && !!detail.name;
}

// lib/process_element.ts
function processElement(elt) {
  const valueRules = [];
  for (const rule of getValueRules()) {
    if (elt.matches(rule.selectorText)) {
      valueRules.push(rule);
    }
  }
  if (valueRules.length || hasAhxAttributes(elt)) {
    const detail = {
      owner: getOwner(elt)
    };
    if (dispatchBefore(elt, "processElement", detail)) {
      if (detail.owner) {
        setOwner(elt, detail.owner);
      }
      for (const rule of valueRules) {
        applyValueRule(elt, rule);
      }
      processTriggers(elt, "click");
      dispatchAfter(elt, "processElement", detail);
    }
  }
}

// lib/process_elements.ts
function processElements(root) {
  const selectors = /* @__PURE__ */ new Set();
  [...config.ahxAttrs, ...config.httpMethods].forEach((attr2) => {
    selectors.add(`[${asAhxAttributeName(attr2)}]`);
  });
  for (const rule of getValueRules()) {
    selectors.add(rule.selectorText);
  }
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

// lib/start_observer.ts
function startObserver(root) {
  const observer = new MutationObserver((mutations) => {
    const detail = { mutations };
    if (dispatchBefore(root, "mutations", detail)) {
      const removedNodes = /* @__PURE__ */ new Set();
      const removedElements = [];
      const addedElements = [];
      for (const mutation of detail.mutations) {
        for (const node of mutation.removedNodes) {
          removedNodes.add(node);
          if (node instanceof Element) {
            removedElements.push(node);
          }
        }
        for (const node of mutation.addedNodes) {
          removedNodes.delete(node);
          if (node instanceof Element) {
            processElements(node);
            addedElements.push(node);
          }
        }
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          processElement(mutation.target);
        }
      }
      dispatchAfter(root, "mutations", {
        ...detail,
        removedElements,
        addedElements
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

// lib/find_rules.ts
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

// lib/create_pseudo_elements.ts
var nextPseudoId = 1;
function createPseudoElements(rule) {
  const before = rule.selectorText.includes("::before");
  const after = before ? false : rule.selectorText.includes("::after");
  if (before || after) {
    const pseudoId = getInternal(rule, "pseudoId") || nextPseudoId++;
    const place = before ? "before" : "after";
    const parentSelector = rule.selectorText.replace(`::${place}`, "");
    for (const elt of document.querySelectorAll(parentSelector)) {
      createPseudoElement(elt, pseudoId, place);
    }
    createPseudoRule(rule, pseudoId, place);
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
      }
    }
  }
}

// lib/apply_value_rules.ts
function applyValueRules(root) {
  for (const rule of getValueRules()) {
    for (const elt of root.querySelectorAll(rule.selectorText)) {
      applyValueRule(elt, rule);
    }
  }
}

// lib/process_value.ts
function processValueRule(rule, props) {
  if (props.has(asAhxCSSPropertyName("value"))) {
    setInternal(rule, "isValueRule", true);
    const document2 = resolveElement(rule)?.ownerDocument;
    if (document2) {
      applyValueRules(document2);
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
function processRule(rule, props = getAhxCSSPropertyNames(rule)) {
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
      processCssImports(rule, props, processRules);
      processGuards(rule, props);
      createPseudoElements(rule);
      processValueRule(rule, props);
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

// lib/process_rules.ts
function processRules(root, rules = findRules(root)) {
  const detail = { rules };
  if (dispatchBefore(root, "processRules", detail)) {
    for (const [rule, props] of detail.rules) {
      processRule(rule, props);
    }
    dispatchAfter(root, "processRules", detail);
  }
}

// lib/trigger_load.ts
function initLoadTriggerHandling(document2) {
  document2.addEventListener(`${config.prefix}:addEventType`, (event) => {
    if (event.detail.eventType === "load") {
      document2.addEventListener(`${config.prefix}:addTrigger:done`, (event2) => {
        console.log("HERE1", event2);
        const { trigger, origin } = event2.detail;
        if (trigger.eventType === "load") {
          dispatchLoad(resolveTargets(origin), { triggerEvent: event2.type });
        }
      });
      document2.addEventListener(
        `${config.prefix}:processElements:done`,
        (event2) => {
          console.log("HERE2", event2);
          if (event2.target) {
            const target = event2.target instanceof Document ? event2.target.documentElement : event2.target;
            dispatchLoad([target], {
              triggerEvent: event2.type,
              recursive: true
            });
          }
        }
      );
      document2.addEventListener(`${config.prefix}:mutations:done`, (event2) => {
        console.log("HERE3", event2);
        dispatchLoad([...event2.detail.addedElements], {
          triggerEvent: event2.type
        });
      });
    }
  });
}
function resolveTargets(origin) {
  if (origin instanceof Element) {
    return [origin];
  } else if (origin instanceof CSSStyleRule) {
    return [...document.querySelectorAll(origin.selectorText)];
  }
  return [];
}
function dispatchLoad(targets, detail) {
  if (targets.length) {
    setTimeout(() => {
      for (const elt of targets) {
        elt.dispatchEvent(
          new CustomEvent("load", {
            bubbles: true,
            detail
          })
        );
      }
    }, 0);
  }
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
  triggers: () => triggers,
  values: () => values2
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
  function addOrigin(elt, origin) {
    if (!elements2.has(elt)) {
      elements2.set(elt, /* @__PURE__ */ new Set());
    }
    elements2.get(elt).add(origin);
  }
  for (const [origin] of objectsWithInternal("triggers")) {
    if (origin instanceof Element) {
      addOrigin(origin, origin);
    } else if (origin instanceof CSSStyleRule) {
      for (const node of document.querySelectorAll(origin.selectorText)) {
        if (node instanceof Element) {
          addOrigin(node, origin);
        }
      }
    }
  }
  const orderedElements = [...elements2.keys()].sort(comparePosition);
  for (const elt of orderedElements) {
    const origins = elements2.get(elt) ?? [];
    const events = /* @__PURE__ */ new Set();
    const denied = isDenied(elt);
    for (const origin of origins) {
      const triggers2 = getInternal(origin, "triggers");
      for (const eventType of triggers2.keys()) {
        events.add(eventType);
      }
    }
    console.groupCollapsed(
      "%o : %c%s",
      elt,
      denied ? "text-decoration: line-through; color: grey" : "color: red",
      [...events].join(", ")
    );
    for (const origin of origins) {
      const triggers2 = getInternal(origin, "triggers");
      for (const { trigger, action } of triggers2.values()) {
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
            action.method.toUpperCase(),
            action.url,
            "color: inherit",
            "color: lightblue",
            originRep,
            "color: inherit"
          );
        }
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

// lib/debug/values.ts
function values2() {
  console.group("AHX Value mapping");
  for (const rule of getValueRules()) {
    console.group(rule.cssText);
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const value = getInternal(elt, "values")?.get(rule);
      const spec = parseTarget(elt, rule);
      if (spec) {
        const { query, type, name, modifier, separator } = spec;
        const target = querySelectorExt(elt, query);
        console.log(
          "%o -> %c%s%c -> %o %s:%s.%s%s",
          elt,
          "font-weight: bold",
          value,
          "font-weight: normal",
          target === elt ? "this" : target,
          type,
          name,
          modifier ?? "default",
          separator ? `("${separator}")` : ""
        );
      } else {
        console.log(
          "%o -> %c%s",
          elt,
          "font-weight: bold",
          value
        );
      }
    }
    console.groupEnd();
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
  for (const rule of getValueRules()) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const targetSpec = parseTarget(elt, rule);
      const target = querySelectorExt(elt, targetSpec?.query);
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

// lib/cssom_patch.ts
function patchCSSOM({ onInsertRule, onDeleteRule }) {
  if (onInsertRule) {
    patchInsertRule(CSSStyleSheet.prototype, onInsertRule);
    patchInsertRule(CSSGroupingRule.prototype, onInsertRule);
  }
  if (onDeleteRule) {
    patchDeleteRule(CSSStyleSheet.prototype, onDeleteRule);
    patchDeleteRule(CSSGroupingRule.prototype, onDeleteRule);
  }
}
function patchInsertRule(proto, onInsertRule) {
  const originalInsertRule = proto.insertRule;
  proto.insertRule = function insertRule(rule, index) {
    const newIndex = originalInsertRule.call(this, rule, index);
    const newRule = this.cssRules[newIndex];
    onInsertRule(this, newRule);
    return newIndex;
  };
}
function patchDeleteRule(proto, onDeleteRule) {
  const originalDeleteRule = proto.deleteRule;
  proto.deleteRule = function deleteRule(index) {
    const oldRule = this.cssRules[index];
    originalDeleteRule.call(this, index);
    onDeleteRule(this, oldRule);
  };
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
    const attr2 = `${config.prefix}-url-${prop}`;
    if (value) {
      elt.setAttribute(attr2, value);
    } else {
      elt.removeAttribute(attr2);
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
patchCSSOM({
  onInsertRule(_parent, rule) {
    if (rule instanceof CSSStyleRule) {
      setTimeout(() => {
        processRule(rule);
      }, 1);
    }
  }
});
ready((document2) => {
  eventsAll();
  initUrlAttrs(document2);
  initLoadTriggerHandling(document2);
  startObserver(document2);
  processRules(document2);
  processElements(document2);
});
window.ahx = debug_exports;
