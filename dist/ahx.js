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
      if (obj) {
        if (valueMap.has(obj)) {
          yield [obj, valueMap.get(obj)];
        }
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
  enableAhxCombinedEvent: false,
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
function dispatchEvent(target, eventType, detail, cancelable = true) {
  const event = new CustomEvent(eventType, {
    bubbles: true,
    cancelable,
    detail
  });
  if (config.enableAhxCombinedEvent) {
    document.dispatchEvent(
      new CustomEvent(config.prefix, {
        bubbles: false,
        cancelable: false,
        detail: event
      })
    );
  }
  return target.dispatchEvent(event);
}
function dispatchBefore(target, name, detail) {
  if (target) {
    detail._before = true;
    const permitted = dispatchEvent(target, `${config.prefix}:${name}`, detail);
    delete detail._before;
    if (!permitted) {
      dispatchEvent(target, `${config.prefix}:${name}:veto`, detail, false);
    }
    return permitted;
  }
  return false;
}
function dispatchAfter(target, name, detail) {
  detail._after = true;
  dispatchEvent(target, `${config.prefix}:${name}:done`, detail, false);
  delete detail._after;
}
function dispatchError(target, name, detail) {
  dispatchEvent(target, `${config.prefix}:${name}:error`, {
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
  return `--${config.prefix}-${name}`;
}
function asAhxAttributeName(name) {
  return `${config.prefix}-${name}`;
}

// lib/parse_css_value.ts
function parseCssValue({ rule, style, prop, elt }) {
  style ??= rule?.style ?? (elt && getComputedStyle(elt));
  const spec = {
    value: style?.getPropertyValue(prop)?.trim(),
    important: style?.getPropertyPriority(prop) === "important"
  };
  if (spec.value) {
    const isAppend = /^--append\(([^\)]*)\)\s+(.+)$/.exec(spec.value);
    if (isAppend) {
      spec.delim = isAppend[1] ? parseQuoted(isAppend[1]) : " ";
      spec.value = isAppend[2];
    }
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

// lib/get_ahx_value.ts
function getAhxValue(origin, name) {
  if (origin instanceof Element) {
    const attrValue = origin.getAttribute(asAhxAttributeName(name));
    const { value, important } = parseCssValue({
      elt: origin,
      prop: asAhxCSSPropertyName(name)
    });
    return important && value ? value : attrValue ?? value;
  } else {
    return parseCssValue({ rule: origin, prop: asAhxCSSPropertyName(name) }).value;
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

// lib/parse_swap.ts
function parseSwap(elt, swapInfoOverride) {
  const swapInfo = swapInfoOverride || getAhxValue(elt, "swap");
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

// lib/swap.ts
async function swap(target, response) {
  if (response.ok && response.headers.get("Content-Type")?.startsWith("text/html")) {
    const content = await response.text();
    const swapSpec = parseSwap(target);
    const detail = {
      ...swapSpec,
      content
    };
    if (dispatchBefore(target, "swap", detail)) {
      const { content: content2, ...swapSpec2 } = detail;
      swapHandlers[swapSpec2.swapStyle]?.(target, content2, swapSpec2);
      dispatchAfter(target, "swap", detail);
    }
  }
}
var swapAdjacent = (target, content, spec) => {
  target.insertAdjacentHTML(spec.swapStyle, content);
};
var swapHandlers = {
  none: () => {
  },
  innerhtml(target, content) {
    target.innerHTML = content;
  },
  outerhtml(target, content) {
    target.outerHTML = content;
  },
  beforebegin: swapAdjacent,
  afterbegin: swapAdjacent,
  beforeend: swapAdjacent,
  afterend: swapAdjacent
};

// lib/handle_trigger.ts
function handleTrigger(trigger, elt) {
  if (isDenied(elt)) {
    dispatchError(elt, "triggerDenied", trigger);
    return;
  }
  if (dispatchBefore(elt, "trigger", trigger)) {
    if (trigger.trigger.target) {
      if (!elt.matches(trigger.trigger.target)) {
        return;
      }
    }
    if (trigger.trigger.once) {
      if (hasInternal(elt, "triggeredOnce")) {
        return;
      } else {
        setInternal(elt, "triggeredOnce", true);
      }
    }
    if (trigger.trigger.changed) {
    }
    if (hasInternal(elt, "delayed")) {
      clearTimeout(getInternal(elt, "delayed"));
      deleteInternal(elt, "delayed");
    }
    if (trigger.trigger.throttle) {
    } else if (trigger.trigger.delay) {
    } else {
      performAction(trigger, elt);
    }
    dispatchAfter(elt, "trigger", trigger);
  }
}
function isDenied(elt) {
  return getAhxValue(elt, "deny-trigger") === "true";
}
async function performAction(trigger, elt) {
  if (dispatchBefore(elt, "performAction", trigger)) {
    switch (trigger.action.type) {
      case "request": {
        const response = await fetch(trigger.action.url, {
          method: trigger.action.method
        });
        swap(elt, response);
      }
    }
    dispatchAfter(elt, "performAction", trigger);
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
  const target = origin instanceof Element ? origin : origin.parentStyleSheet?.ownerNode ?? document;
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
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;
    const trigger = getInternal(event.target, "triggers")?.get(event.type);
    if (trigger) {
      yield [trigger, event.target];
    }
    for (const [origin, triggers2] of objectsWithInternal("triggers")) {
      if (origin instanceof CSSStyleRule) {
        const trigger2 = triggers2.get(event.type);
        if (trigger2 && isEnabled(origin)) {
          if (trigger2 && event.target.matches(origin.selectorText)) {
            yield [trigger2, event.target];
          }
          if (recursive) {
            const found = event.target.querySelectorAll(origin.selectorText);
            for (const elt of found) {
              yield [trigger2, elt];
            }
          }
        }
      }
    }
  }
}
function eventListener(event) {
  for (const [trigger_, elt] of getTriggersForEvent(event)) {
    handleTrigger(trigger_, elt);
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
  const elt = origin instanceof Element ? origin : origin.parentStyleSheet?.ownerNode instanceof Element ? origin.parentStyleSheet.ownerNode : void 0;
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
              dispatchError(elt ?? document, "triggerSyntax", {
                token: tokens.shift()
              });
            }
          }
          triggerSpecs.push(triggerSpec);
        }
      }
      if (tokens.length === initialLength) {
        dispatchError(elt ?? document, "triggerSyntax", {
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
    const url = getAhxValue(origin, method);
    if (url) {
      actionSpecs.push({
        type: "request",
        method,
        url
      });
    }
  }
  return actionSpecs;
}

// lib/process_triggers.ts
function processTriggers(origin, defaultEventType) {
  const triggerValue = getAhxValue(origin, "trigger");
  const triggers2 = parseTriggers(origin, triggerValue, defaultEventType);
  const actions = parseActions(origin);
  addTriggers(origin, triggers2, actions);
}

// lib/process_element.ts
function processElement(elt) {
  if (hasAhxAttributes(elt)) {
    const detail = {};
    if (dispatchBefore(elt, "processElement", detail)) {
      processTriggers(elt, "click");
      dispatchAfter(elt, "processElement", detail);
    }
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
            processElement(node);
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
  collapse: true
};
var rootRef;
function eventsAll(root = document) {
  config.enableAhxCombinedEvent = true;
  if (!rootRef) {
    root.addEventListener(config.prefix, logger);
    rootRef = new WeakRef(root);
  }
}
function eventsNone() {
  rootRef?.deref()?.removeEventListener(config.prefix, logger);
  rootRef = void 0;
}
function logger({ detail: event }) {
  const detail = event.detail;
  if (detail?._before) {
    console[loggerConfig.collapse ? "groupCollapsed" : "group"](event.type, event, detail);
  } else {
    console.log(event.type, event, detail);
  }
  if (detail?._after) {
    console.groupEnd();
  }
}

// lib/process_tree.ts
function processTree(root, selector = defaultSelector()) {
  const detail = { selector };
  if (dispatchBefore(root, "processTree", detail)) {
    const elements2 = root.querySelectorAll(detail.selector);
    for (const elt of elements2) {
      processElement(elt);
    }
    dispatchAfter(root, "processTree", detail);
  }
}
function defaultSelector() {
  return [...config.ahxAttrs, ...config.httpMethods].map(
    (attr) => `[${asAhxAttributeName(attr)}]`
  ).join(",");
}

// lib/find_style_rules.ts
function findStyleRules(root) {
  const cssRules = /* @__PURE__ */ new Map();
  function fromStylesheet(stylesheet) {
    if (!stylesheet.disabled) {
      try {
        fromRules(stylesheet.cssRules);
      } catch {
      }
    }
  }
  function fromRules(rules) {
    for (const rule of rules) {
      if (rule instanceof CSSImportRule && rule.styleSheet) {
        fromStylesheet(rule.styleSheet);
      } else if (rule instanceof CSSGroupingRule) {
        fromRules(rule.cssRules);
      } else if (rule instanceof CSSStyleRule) {
        fromStyleRule(rule);
      }
    }
  }
  function fromStyleRule(rule) {
    const props = getAhxCSSPropertyNames(rule);
    if (props.size > 0) {
      cssRules.set(rule, props);
    }
  }
  for (const stylesheet of root.styleSheets) {
    fromStylesheet(stylesheet);
  }
  return cssRules;
}

// lib/process_css_imports.ts
function processCssImports(rule, props, onReady) {
  const importProp = asAhxCSSPropertyName("import");
  for (const prop of props) {
    if (prop === importProp || prop.startsWith(`${importProp}-`)) {
      let link = getInternal(rule, "importLinks")?.get(prop);
      let ruleApplies = false;
      for (const elt of document.querySelectorAll(rule.selectorText)) {
        const url = parseCssValue({ rule, prop, elt }).value;
        if (url) {
          ruleApplies = true;
          if (link) {
            if (link.sheet && link.sheet.disabled) {
              link.sheet.disabled = false;
              setTimeout(() => {
                onReady?.();
              }, 0);
            }
            break;
          } else {
            link = createStyleSheetLink(
              url,
              rule.parentStyleSheet?.ownerNode?.crossOrigin ?? void 0,
              onReady
            );
            if (link) {
              getInternal(rule, "importLinks", () => /* @__PURE__ */ new Map()).set(prop, link);
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
        setTimeout(() => {
          dispatchAfter(event.target ?? document, "cssImport", detail);
          onReady?.();
        }, 0);
      }, { once: true, passive: true });
      document.head.appendChild(link);
      return link;
    }
  }
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
      place
    };
    if (dispatchBefore(document, "pseudoRule", detail)) {
      const styleSheet = detail.pseudoRule.parentStyleSheet;
      if (styleSheet) {
        const cssRules = styleSheet.cssRules;
        const pseudoRule2 = cssRules[styleSheet.insertRule(detail.pseudoRule.cssText, cssRules.length)];
        dispatchAfter(document, "pseudoRule", {
          ...detail,
          pseudoRule: pseudoRule2
        });
      }
    }
  }
}

// lib/process_rule.ts
function processRule(rule, props = getAhxCSSPropertyNames(rule)) {
  if (props.size) {
    const detail = { rule, props };
    const target = rule.parentStyleSheet?.ownerNode ?? document;
    if (dispatchBefore(target, "processRule", detail)) {
      processGuards(rule, props);
      createPseudoElements(rule);
      processTriggers(rule, "default");
      dispatchAfter(target, "processRule", detail);
    }
  }
}

// lib/process_stylesheets.ts
function processStyleSheets(root) {
  const detail = {
    cssRules: findStyleRules(root)
  };
  if (dispatchBefore(root, "processStyleSheets", detail)) {
    const cssRules = detail.cssRules;
    if (!cssRules) {
      return;
    }
    for (const [rule, props] of cssRules) {
      processCssImports(rule, props, () => {
        processStyleSheets(root);
      });
    }
    for (const [rule, props] of cssRules) {
      processRule(rule, props);
    }
    dispatchAfter(document, "processStyleSheets", detail);
  }
}

// lib/trigger_load.ts
function initLoadTriggerHandling(document2) {
  document2.addEventListener(`${config.prefix}:addEventType`, (event) => {
    if (event.detail.eventType === "load") {
      document2.addEventListener(`${config.prefix}:addTrigger:done`, (event2) => {
        if (event2.detail.trigger.eventType === "load" && event2.target) {
          dispatchLoad([event2.target], { triggerEvent: event2.type });
        }
      });
      document2.addEventListener(
        `${config.prefix}:processTree:done`,
        (event2) => {
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
        dispatchLoad([...event2.detail.addedElements], {
          triggerEvent: event2.type
        });
      });
    }
  });
}
function dispatchLoad(targets, detail) {
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

// lib/debug.ts
var debug_exports = {};
__export(debug_exports, {
  elements: () => elements,
  eventsAll: () => eventsAll,
  eventsNone: () => eventsNone,
  internals: () => internals,
  logger: () => logger,
  loggerConfig: () => loggerConfig,
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
      const value = getAhxValue(elt, ahxProp);
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
    for (const origin of origins) {
      const triggers2 = getInternal(origin, "triggers");
      for (const eventType of triggers2.keys()) {
        events.add(eventType);
      }
    }
    console.groupCollapsed(elt, ...events);
    for (const origin of origins) {
      const triggers2 = getInternal(origin, "triggers");
      for (const { trigger, action } of triggers2.values()) {
        if (verbose) {
          console.log("trigger:", trigger, "action:", action, "origin:", origin);
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
            "color: blue",
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

// lib/ahx.ts
patchCSSOM({
  onInsertRule() {
    setTimeout(() => {
      processStyleSheets(document);
    }, 0);
  }
});
ready((document2) => {
  eventsAll(document2);
  initLoadTriggerHandling(document2);
  startObserver(document2);
  processStyleSheets(document2);
  processTree(document2);
});
window.ahx = debug_exports;
