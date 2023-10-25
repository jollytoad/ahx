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
function cloneInternal(src, dst) {
  for (const [key, valueMap] of values.entries()) {
    if (key.startsWith("triggered:")) {
      const value = valueMap.get(src);
      if (value !== void 0) {
        setInternal(dst, key, value);
      }
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
    const thing = weakRef.deref();
    if (thing) {
      for (const [key, valueMap] of values.entries()) {
        if (valueMap.has(thing)) {
          yield [thing, key, valueMap.get(thing)];
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
function isAhxHeaderName(name) {
  return name.startsWith(`${config.prefix}-`);
}
function asAhxCSSPropertyName(name) {
  return isAhxCSSPropertyName(name) ? name : isAhxAttributeName(name) ? `--${name}` : `--${config.prefix}-${name}`;
}
function asAhxAttributeName(name) {
  return isAhxAttributeName(name) ? name : isAhxCSSPropertyName(name) ? name.substring(2) : `${config.prefix}-${name}`;
}
function asAhxHeaderName(name) {
  return isAhxHeaderName(name) ? name : `${config.prefix}-${name}`;
}

// lib/util/owner.ts
function getOwner(thing) {
  if (hasInternal(thing, "owner")) {
    return getInternal(thing, "owner");
  }
  if (thing instanceof StyleSheet) {
    return getInternal(thing, "owner") ?? thing.href ?? void 0;
  }
  if (thing instanceof CSSRule && thing.parentStyleSheet) {
    return getOwner(thing.parentStyleSheet);
  }
  if (thing instanceof Element && thing.parentElement) {
    return getOwner(thing.parentElement);
  }
}
function setOwner(thing, owner) {
  if (owner !== getOwner(thing)) {
    setInternal(thing, "owner", owner);
  }
}

// lib/parse_css_value.ts
function parseCssValue(prop, rule, elt, expect = "tokens") {
  prop = asAhxCSSPropertyName(prop);
  let value = rule.style.getPropertyValue(prop)?.trim();
  if (value) {
    const isAttr = /^attr\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(value);
    if (isAttr) {
      if (!elt) {
        return [value];
      }
      value = elt.getAttribute(isAttr[1]) ?? void 0;
      if (value && isAttr[2] === "url") {
        value = parseURL2(value, elt.baseURI);
      }
      return value ? [value] : [];
    } else {
      const isProp = /^--prop\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(value);
      if (isProp) {
        if (!elt) {
          return [value];
        }
        value = void 0;
        const propValue = elt[isProp[1]];
        if (isProp[2] === "url" && typeof propValue === "string") {
          value = parseURL2(propValue, elt.baseURI);
        } else if (typeof propValue === "string" || typeof propValue === "number" || typeof propValue === "boolean") {
          value = String(propValue);
        }
        return value ? [value] : [];
      }
    }
    const isURL = /^url\(([^\)]*)\)(?:\s+url\(([^\)]*)\))*$/.exec(value);
    if (isURL) {
      const [, ...values2] = isURL;
      const baseURL = rule.parentStyleSheet?.href ?? rule.style.parentRule?.parentStyleSheet?.href ?? elt?.baseURI;
      return values2.flatMap((value2) => {
        const url = value2 ? parseURL2(parseQuoted(value2), baseURL) : void 0;
        return url ? [url] : [];
      });
    }
    value = parseQuoted(value);
  }
  return value ? expect === "tokens" ? value.split(/\s+/).map(parseQuoted) : [value] : [];
  function parseURL2(value2, baseURL) {
    try {
      return new URL(value2, baseURL).href;
    } catch (e) {
      console.error(e, value2, baseURL);
    }
  }
}
function parseQuoted(value) {
  const isQuoted = /^\"([^\"]*)\"$/.exec(value) ?? /^\'([^\']*)\'$/.exec(value);
  if (isQuoted) {
    return isQuoted[1];
  }
  return value;
}

// lib/parse_attr_value.ts
function parseAttrValue(prop, control, expect = "tokens") {
  prop = asAhxAttributeName(prop);
  const value = control.getAttribute(prop) ?? void 0;
  return value ? expect === "tokens" ? value.split(/\s+/) : [value] : [];
}
function parseAttrOrCssValue(prop, control, expect = "tokens") {
  if (control instanceof Element) {
    return parseAttrValue(prop, control, expect);
  } else {
    return parseCssValue(prop, control, void 0, expect);
  }
}

// lib/parse_triggers.ts
function parseTriggers(control) {
  const [rawValue] = parseAttrOrCssValue("trigger", control, "whole");
  const triggerSpecs = [];
  if (rawValue) {
    const triggerValues = rawValue.split(/\s*,\s*/);
    for (const triggerValue of triggerValues) {
      const [trigger, ...modifiers] = triggerValue.split(/\s+/);
      if (trigger) {
        const triggerSpec = { eventType: trigger };
        for (const modifier of modifiers) {
          switch (modifier) {
            case "once":
              triggerSpec[modifier] = true;
              break;
          }
        }
        triggerSpecs.push(triggerSpec);
      }
    }
  }
  return triggerSpecs;
}

// lib/parse_actions.ts
function parseActions(control) {
  const actionSpecs = [];
  for (const method of config.httpMethods) {
    const [url] = parseAttrOrCssValue(method, control);
    if (url) {
      actionSpecs.push({
        type: "request",
        method,
        url: parseURL(url, control)
      });
    }
  }
  if (control instanceof CSSStyleRule) {
    if (getAhxCSSPropertyNames(control).has(asAhxCSSPropertyName("harvest"))) {
      actionSpecs.push({
        type: "harvest"
      });
    }
  }
  return actionSpecs;
}
function parseURL(url, control) {
  const baseURL = control instanceof Element ? control.baseURI : void 0;
  try {
    return new URL(url, baseURL);
  } catch {
    return void 0;
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
function parseSwap(control) {
  const tokens = parseAttrOrCssValue("swap", control, "tokens");
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
   * @param {boolean} [template] extract content out of a template element
   */
  constructor(document2, template) {
    let parser;
    let container;
    super({
      start() {
        parser = document2.implementation.createHTMLDocument();
      },
      transform(chunk, controller) {
        parser.write(chunk);
        if (!container && parser.body?.childElementCount > 0) {
          const element = parser.body.children[0];
          if (template && element instanceof HTMLTemplateElement) {
            container = element.content;
          } else {
            container = parser.body;
          }
        }
        while (container?.childElementCount > 1) {
          const element = container.children[0];
          document2.adoptNode(element);
          controller.enqueue(element);
        }
      },
      flush(controller) {
        for (const element of [...container?.children ?? []]) {
          document2.adoptNode(element);
          controller.enqueue(element);
        }
        parser.close();
        parser = void 0;
        container = void 0;
      }
    });
  }
};

// lib/util/slots.ts
function findSlot(name, root) {
  for (const [thing, slotNames] of objectsWithInternal("slotName")) {
    if (slotNames.has(name)) {
      if (thing instanceof Element) {
        return thing;
      } else if (thing instanceof CSSStyleRule) {
        const slot = root.querySelector(thing.selectorText);
        if (slot) {
          return slot;
        }
      }
    }
  }
  for (const slot of root.querySelectorAll(`slot[name]`)) {
    if (name === slot.getAttribute("name")) {
      return slot;
    }
  }
}

// lib/swap_html.ts
async function swapHtml(props) {
  const { response, target } = props;
  const document2 = target.ownerDocument;
  if (response?.ok && response.headers.get("Content-Type")?.startsWith("text/html") && response.body) {
    let index = 0;
    let previous2;
    const elements2 = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new HTMLBodyElementParserStream(document2, true));
    for await (const element of elements2) {
      const detail = {
        ...props,
        swapStyle: props.swapStyle ?? "none",
        element,
        previous: previous2,
        index
      };
      const [slot] = parseAttrValue("slot", element);
      if (slot) {
        detail.slot = slot;
        const slotTarget = findSlot(slot, document2);
        if (slotTarget) {
          detail.target = slotTarget;
          detail.swapStyle = "inner";
        } else {
          detail.swapStyle = "none";
        }
      }
      if (dispatchBefore(target, "swap", detail)) {
        const { target: target2, element: element2, controlOwner, swapStyle, slot: slot2 } = detail;
        if (controlOwner) {
          setOwner(element2, controlOwner);
        }
        if (slot2 || !previous2) {
          swapHandlers[swapStyle]?.(target2, element2);
        } else {
          previous2.after(element2);
        }
        if (!slot2) {
          previous2 = element2;
        }
        dispatchAfter(target2, "swap", detail);
      }
      index++;
    }
  }
}
var swapAdjacent = (pos) => (target, element) => {
  target.insertAdjacentElement(pos, element);
};
var swapHandlers = {
  none() {
  },
  inner(target, element) {
    target.replaceChildren(element);
  },
  outer(target, element) {
    const pseudoPrefix = `${config.prefix}-pseudo`;
    for (const cls of target.classList) {
      if (cls.startsWith(pseudoPrefix)) {
        element.classList.add(cls);
      }
    }
    cloneInternal(target, element);
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
          swapStyle: swapStyle ?? "none",
          response
        });
      }
  }
}
function isHtmlResponse(response) {
  return !!response?.headers.get("Content-Type")?.startsWith("text/html") && !!response.body;
}

// lib/handle_request.ts
async function handleRequest(props) {
  const { source, action, target, swap, controlOwner, targetOwner } = props;
  if (action.type !== "request") {
    return;
  }
  const request = prepareRequest({ ...props, action });
  if (!request) {
    return;
  }
  const detail = { request };
  if (dispatchBefore(source, "request", detail)) {
    const { request: request2 } = detail;
    try {
      const response = await fetch(request2);
      dispatchAfter(source, "request", { request: request2, response });
      if (response.headers.has(asAhxHeaderName("refresh"))) {
        const detail2 = {
          ...props,
          request: request2,
          response,
          refresh: true,
          url: new URL(location.href)
        };
        if (dispatchBefore(source, "navigate", detail2)) {
          location.reload();
          return;
        }
      }
      await handleSwap({
        ...swap,
        target,
        response,
        controlOwner,
        targetOwner
      });
    } catch (error) {
      dispatchAfter(source, "request", { request: request2, error });
    }
  }
}
function prepareRequest(detail) {
  const { action, formData, source } = detail;
  if (!action.url) {
    dispatchError(source, "invalidRequest", {
      action,
      reason: "Missing URL"
    });
    return;
  }
  const url = new URL(action.url);
  const headers = new Headers();
  const init = {
    method: action.method.toUpperCase(),
    headers
  };
  headers.set("Accept", "text/html,application/xhtml+xml,text/plain;q=0.9");
  headers.set(asAhxHeaderName("request"), "true");
  headers.set(
    asAhxHeaderName("current-url"),
    source.ownerDocument.location.href
  );
  if (formData) {
    switch (init.method) {
      case "GET":
      case "HEAD":
      case "DELETE":
        for (const [key, value] of formData) {
          if (typeof value === "string") {
            url.searchParams.append(key, value);
          }
        }
        break;
      case "PUT":
      case "POST":
      case "PATCH":
        if (containsFile(formData)) {
          init.body = formData;
          headers.set("Content-Type", "multipart/form-data");
        } else {
          init.body = new URLSearchParams(formData);
          headers.set("Content-Type", "application/x-www-form-urlencoded");
        }
    }
  }
  return new Request(url, init);
}
function containsFile(formData) {
  for (const value of formData.values()) {
    if (value instanceof File) {
      return true;
    }
  }
  return false;
}

// lib/handle_harvest.ts
async function handleHarvest(props) {
  const {
    event,
    source,
    action,
    target,
    swap,
    control,
    controlOwner,
    targetOwner
  } = props;
  if (!(control instanceof CSSStyleRule) || action.type !== "harvest") {
    return;
  }
  const [newValue] = parseCssValue("harvest", control, source);
  if (newValue === void 0) {
    return;
  }
  const oldValue = getOldValue(event);
  const detail = {
    source,
    oldValue,
    newValue,
    control,
    targetOwner,
    controlOwner
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
  const { source, control, action } = detail;
  const [query] = parseAttrOrCssValue("include", control, "whole");
  const include = querySelectorExt(source, query);
  detail.formData = include ? getFormData(include) : void 0;
  if (action.type === "request" && control instanceof CSSStyleRule && action.url === void 0) {
    const [url] = parseCssValue(action.method, control, source);
    if (url) {
      detail.action = {
        ...action,
        url: new URL(url, source.baseURI)
      };
    }
  }
  if (dispatchBefore(source, "action", detail)) {
    switch (detail.action.type) {
      case "request":
        await handleRequest(detail);
        break;
      case "harvest":
        await handleHarvest(detail);
        break;
    }
    dispatchAfter(source, "action", detail);
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
  const { control, trigger, source } = detail;
  if (isDenied(source)) {
    dispatchError(source, "triggerDenied", detail);
    return;
  }
  if (trigger?.once && getInternal(source, `triggered:${trigger.eventType}`)?.has(control)) {
    return;
  }
  if (trigger?.changed) {
  }
  if (dispatchBefore(source, "trigger", detail)) {
    if (trigger?.once) {
      getInternal(source, `triggered:${trigger.eventType}`, () => /* @__PURE__ */ new WeakSet()).add(control);
    }
    if (hasInternal(control, "delayed")) {
      clearTimeout(getInternal(control, "delayed"));
      deleteInternal(control, "delayed");
    }
    if (trigger?.throttle) {
    } else if (trigger?.delay) {
    } else {
      handleAction(detail);
    }
    dispatchAfter(source, "trigger", detail);
  }
}
function isDenied(elt) {
  const [deny] = parseAttrOrCssValue("deny-trigger", elt);
  return deny === "true";
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
function isRuleEnabled(rule) {
  return !!rule.parentStyleSheet && !rule.parentStyleSheet.disabled;
}
var ruleCount = 0;
function getRuleId(rule) {
  return getInternal(rule, "ruleId", () => `${++ruleCount}`);
}

// lib/util/controls.ts
function* getControlsFromElements(eventType, root, recursive) {
  const ctlSpec = getInternal(root, `control:${eventType}`);
  if (ctlSpec) {
    yield [root, root, ctlSpec];
  }
  if (recursive) {
    for (const [elt, ctlSpec2] of objectsWithInternal(`control:${eventType}`)) {
      if (elt instanceof Element && root.compareDocumentPosition(elt) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        yield [elt, elt, ctlSpec2];
      }
    }
  }
}
function* getControlsFromRules(eventType, root, recursive) {
  for (const [rule, ctlSpec] of objectsWithInternal(`control:${eventType}`)) {
    if (ctlSpec && rule instanceof CSSStyleRule && isRuleEnabled(rule)) {
      if (root.matches(rule.selectorText)) {
        yield [root, rule, ctlSpec];
      }
      if (recursive) {
        for (const elt of root.querySelectorAll(rule.selectorText)) {
          yield [elt, rule, ctlSpec];
        }
      }
    }
  }
}
function* getControls(eventType, root, recursive) {
  yield* getControlsFromElements(eventType, root, recursive);
  yield* getControlsFromRules(eventType, root, recursive);
}

// lib/parse_target.ts
function parseTarget(elt, control) {
  const [targetQuery] = parseAttrOrCssValue("target", control, "whole");
  return querySelectorExt(elt, targetQuery) ?? elt;
}

// lib/event_listener.ts
var eventTypes = /* @__PURE__ */ new Set();
function initEventListener(eventType) {
  if (!eventTypes.has(eventType)) {
    const detail = { eventType };
    if (dispatchBefore(void 0, "addEventType", detail)) {
      eventTypes.add(eventType);
      addEventListener(toDOMEventType(eventType), eventListener);
      dispatchAfter(void 0, "addEventType", detail);
    }
  }
}
function eventListener(event) {
  for (const detail of getTriggerDetailsForEvent(event)) {
    handleTrigger(detail);
  }
}
function* getTriggerDetailsForEvent(event) {
  if (event.target instanceof Element) {
    const controls2 = getControls(
      fromDOMEventType(event.type),
      event.target,
      isRecursive(event)
    );
    for (const [source, control, ctlSpec] of controls2) {
      const target = parseTarget(source, control);
      yield {
        ...ctlSpec,
        event,
        source,
        sourceOwner: getOwner(source),
        target,
        targetOwner: getOwner(target),
        control,
        controlOwner: getOwner(control)
      };
    }
  }
}
function isRecursive(event) {
  return event instanceof CustomEvent && !!event.detail?.recursive;
}

// lib/util/resolve_element.ts
function resolveElement(thing) {
  if (thing instanceof Element) {
    return thing;
  }
  if (thing && "ownerNode" in thing && thing.ownerNode && thing.ownerNode instanceof Element) {
    return thing.ownerNode;
  }
  if (thing?.parentStyleSheet) {
    return resolveElement(thing.parentStyleSheet);
  }
  if (thing && "ownerRule" in thing) {
    return resolveElement(thing.ownerRule);
  }
}

// lib/process_control.ts
function processControl(detail) {
  const target = resolveElement(detail.control);
  if (dispatchBefore(target, "processControl", detail)) {
    const { control, trigger, action, swap } = detail;
    const { eventType } = trigger;
    setInternal(control, `control:${eventType}`, { trigger, action, swap });
    initEventListener(eventType);
    dispatchAfter(target, "processControl", detail);
  }
}

// lib/process_controls.ts
function processControls(control) {
  const triggers = parseTriggers(control);
  const actions = parseActions(control);
  const swap = parseSwap(control);
  for (const trigger of triggers) {
    for (const action of actions) {
      processControl({
        control,
        trigger,
        action,
        swap
      });
    }
  }
}

// lib/process_slot.ts
function processSlot(control) {
  const slotNames = parseAttrOrCssValue("slot-name", control, "tokens");
  if (slotNames.length) {
    const names = getInternal(control, "slotName", () => /* @__PURE__ */ new Set());
    slotNames.forEach((name) => names.add(name));
  }
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
      processControls(elt);
      processSlot(elt);
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
    const [value] = parseCssValue(prop, rule);
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
function processCssImports(rule, onReady) {
  const ruleApplies = !!resolveElement(rule)?.ownerDocument?.querySelector(
    rule.selectorText
  );
  const urls = parseCssValue("import", rule);
  for (const url of urls) {
    let link = getInternal(rule, "importLinks")?.get(url)?.deref();
    if (link) {
      if (ruleApplies && link.sheet?.disabled) {
        link.sheet.disabled = false;
        setTimeout(() => {
          onReady?.(link);
        }, 0);
      } else if (!ruleApplies && link.sheet) {
        link.sheet.disabled = true;
      }
    } else if (ruleApplies) {
      link = createStyleSheetLink(
        url,
        resolveElement(rule)?.crossOrigin ?? void 0,
        onReady
      );
      if (link) {
        getInternal(rule, "importLinks", () => /* @__PURE__ */ new Map()).set(
          url,
          new WeakRef(link)
        );
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
  const ruleId = getRuleId(rule);
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
      setRuleId(rule, ruleId, props);
      processCssImports(rule, processImportedRules);
      processGuards(rule, props);
      const pseudoRule = processPseudoElements(rule);
      if (pseudoRule) {
        processRule(pseudoRule, getAhxCSSPropertyNames(pseudoRule));
      }
      processControls(rule);
      processSlot(rule);
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
function setRuleId(rule, ruleId, props) {
  const ruleProp = asAhxCSSPropertyName("rule");
  if (!props.has(ruleProp)) {
    rule.style.setProperty(ruleProp, ruleId);
  }
  const ruleIdProp = asAhxCSSPropertyName(`rule-${ruleId}`);
  if (!props.has(ruleIdProp)) {
    rule.style.setProperty(ruleIdProp, ruleId);
  }
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
        deleteInternalRecursive(node);
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
function deleteInternalRecursive(node) {
  deleteInternal(node);
  for (const child of node.childNodes) {
    deleteInternalRecursive(child);
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
  controls: () => controls,
  elements: () => elements,
  eventsAll: () => eventsAll,
  eventsNone: () => eventsNone,
  forms: () => forms,
  internals: () => internals,
  logger: () => logger,
  loggerConfig: () => loggerConfig,
  owners: () => owners
});

// lib/debug/internals.ts
function internals() {
  console.group("ahx internal properties...");
  let groupObject;
  for (const [thing, key, value] of internalEntries()) {
    if (thing !== groupObject) {
      if (groupObject) {
        console.groupEnd();
      }
      const representation = thing instanceof CSSRule ? thing.cssText : thing;
      console.groupCollapsed(representation);
      console.dir(thing);
      if (thing instanceof CSSStyleRule) {
        for (const node of document.querySelectorAll(thing.selectorText)) {
          console.log(node);
        }
      }
      groupObject = thing;
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
  console.group("ahx elements...");
  const elements2 = /* @__PURE__ */ new Set();
  const rules = /* @__PURE__ */ new Set();
  for (const [thing] of internalEntries()) {
    if (thing instanceof Element) {
      elements2.add(thing);
    } else if (thing instanceof CSSStyleRule) {
      rules.add(thing);
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
      const tokens = parseAttrValue(ahxProp, elt);
      if (tokens.length) {
        console.log(elt, ...tokens);
      }
    } else {
      console.log(elt);
    }
  }
  console.groupEnd();
}

// lib/debug/controls.ts
function controls(verbose = false) {
  console.group("ahx controls...");
  const elements2 = /* @__PURE__ */ new Map();
  function addControl(elt, ctlDecl, ctlSpec) {
    if (!elements2.has(elt)) {
      elements2.set(elt, /* @__PURE__ */ new Map());
    }
    elements2.get(elt).set(ctlSpec, ctlDecl);
  }
  for (const [ctlDecl, key, ctlSpec] of internalEntries()) {
    if (key.startsWith("control:")) {
      if (ctlDecl instanceof Element) {
        addControl(ctlDecl, ctlDecl, ctlSpec);
      } else if (ctlDecl instanceof CSSStyleRule) {
        for (const node of document.querySelectorAll(ctlDecl.selectorText)) {
          if (node instanceof Element) {
            addControl(node, ctlDecl, ctlSpec);
          }
        }
      }
    }
  }
  const orderedElements = [...elements2.keys()].sort(comparePosition);
  for (const elt of orderedElements) {
    const controls2 = elements2.get(elt) ?? [];
    const events = /* @__PURE__ */ new Set();
    const denied = isDenied(elt);
    for (const [{ trigger }] of controls2) {
      events.add(trigger.eventType);
    }
    console.groupCollapsed(
      "%o : %c%s",
      elt,
      denied ? "text-decoration: line-through; color: grey" : "color: red",
      [...events].join(", ")
    );
    for (const [{ trigger, action, swap }, control] of controls2) {
      if (verbose) {
        console.log(
          "trigger:",
          trigger,
          "action:",
          action,
          "swap:",
          swap,
          "control:",
          control
        );
      } else {
        const ctlRep = control instanceof Element ? "element" : control.cssText;
        const actionRep = "method" in action ? `${action.method.toUpperCase()} ${action.url}` : action.type;
        const swapRep = (swap.swapStyle ?? "default") + (swap.itemName ? ` ${swap.itemName}` : "");
        console.log(
          "%c%s%c -> %c%s%c -> %c%s%c from: %c%s%c",
          "color: red; font-weight: bold",
          trigger.eventType,
          "color: inherit; font-weight: normal",
          "color: green",
          actionRep,
          "color: inherit",
          "color: darkorange",
          swapRep,
          "color: inherit",
          "color: hotpink",
          ctlRep,
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
  console.group("ahx ownership...");
  const elements2 = /* @__PURE__ */ new Set();
  for (const [thing, key, owner] of internalEntries()) {
    if (thing instanceof Element) {
      elements2.add(thing);
    } else if (key === "owner") {
      if (thing instanceof CSSRule) {
        console.log("%o -> %s", thing.cssText, owner);
      } else {
        console.log("%o -> %s", thing, owner);
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
  console.group("ahx form...");
  const elements2 = /* @__PURE__ */ new Set();
  for (const [elt] of objectsWithInternal("formData")) {
    if (elt instanceof Element) {
      elements2.add(elt);
    }
  }
  for (const [rule] of getControlRulesByAction("harvest")) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      elements2.add(parseTarget(elt, rule));
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
function* getControlRulesByAction(type) {
  for (const [rule, key, control] of internalEntries()) {
    if (key.startsWith("control:") && rule instanceof CSSStyleRule && typeof control === "object" && "action" in control && control.action.type === type && isRuleEnabled(rule)) {
      yield [rule, control];
    }
  }
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
