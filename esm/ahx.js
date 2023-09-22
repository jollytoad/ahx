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
  customProps: [
    "--name",
    "--value",
    "--class"
  ],
  maxLoopCount: 10,
  defaultDelay: 20,
  defaultSettleDelay: 20,
  defaultSwapDelay: 0,
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

// lib/parse_actions.ts
function parseActions(elt) {
  const actionSpecs = [];
  for (const method of config.httpMethods) {
    const attr = `${config.prefix}-${method}`;
    if (elt.hasAttribute(attr)) {
      actionSpecs.push({
        type: "request",
        method,
        url: elt.getAttribute(attr) ?? ""
      });
    }
  }
  return actionSpecs;
}

// lib/attributes.ts
function hasAhxAttributes(elt) {
  for (const attr of elt.attributes) {
    if (attr.name.startsWith(`${config.prefix}-`)) {
      return true;
    }
  }
}
var selector;
function ahxSelector() {
  if (!selector) {
    selector = [...config.ahxAttrs, ...config.httpMethods].map(
      (attr) => `[${config.prefix}-${attr}]`
    ).join(",");
  }
  return selector;
}

// lib/trigger_event.ts
function triggerEvent(target, eventType, detail, cancelable = true) {
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
function triggerBeforeEvent(target, name, detail) {
  if (target) {
    detail._before = true;
    const permitted = triggerEvent(target, `${config.prefix}:${name}`, detail);
    if (!permitted) {
      triggerEvent(target, `${config.prefix}:${name}:veto`, detail, false);
    }
    return permitted;
  }
  return false;
}
function triggerAfterEvent(target, name, detail) {
  detail._after = true;
  delete detail._before;
  triggerEvent(target, `${config.prefix}:${name}:done`, detail, false);
}
function triggerErrorEvent(target, name, detail) {
  triggerEvent(target, `${config.prefix}:${name}:error`, { error: name, ...detail }, false);
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
      const isAttr = /^attr\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(spec.value);
      if (isAttr) {
        spec.value = elt.getAttribute(isAttr[1]) ?? void 0;
        if (spec.value && isAttr[2] === "url") {
          spec.value = new URL(spec.value, elt.baseURI).href;
        }
        return spec;
      } else {
        const isProp = /^--prop\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(spec.value);
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
      const styleSheet = rule?.parentStyleSheet ?? style?.parentRule?.parentStyleSheet;
      spec.value = new URL(spec.value, styleSheet?.href ?? void 0).href;
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
function getAhxValue(target, name) {
  if (target instanceof Element) {
    const attrValue = target.getAttribute(`${config.prefix}-${name}`);
    const { value, important } = parseCssValue({ elt: target, prop: `--${config.prefix}-${name}` });
    return important && value ? value : attrValue ?? value;
  } else {
    return parseCssValue({ rule: target, prop: `--${config.prefix}-${name}` }).value;
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
    swapStyle: "innerhtml",
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
    if (triggerBeforeEvent(target, "swap", detail)) {
      const { content: content2, ...swapSpec2 } = detail;
      swapHandlers[swapSpec2.swapStyle]?.(target, content2, swapSpec2);
      triggerAfterEvent(target, "swap", detail);
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

// lib/trigger_rule.ts
var triggeredOnce = /* @__PURE__ */ new WeakSet();
var delayed = /* @__PURE__ */ new WeakMap();
function triggerRule(rule, elt) {
  if (elt && triggerBeforeEvent(elt, "triggerRule", rule)) {
    if (rule.trigger.target) {
      if (!elt.matches(rule.trigger.target)) {
        return;
      }
    }
    if (rule.trigger.once) {
      if (triggeredOnce.has(elt)) {
        return;
      } else {
        triggeredOnce.add(elt);
      }
    }
    if (rule.trigger.changed) {
    }
    if (delayed.has(elt)) {
      clearTimeout(delayed.get(elt));
      delayed.delete(elt);
    }
    if (rule.trigger.throttle) {
    } else if (rule.trigger.delay) {
    } else {
      performAction(elt, rule);
    }
    triggerAfterEvent(elt, "triggerRule", rule);
  }
}
async function performAction(elt, rule) {
  if (triggerBeforeEvent(elt, "performAction", rule)) {
    switch (rule.action.type) {
      case "request": {
        const response = await fetch(rule.action.url, {
          method: rule.action.method
        });
        swap(elt, response);
      }
    }
    triggerAfterEvent(elt, "performAction", rule);
  }
}

// lib/rules.ts
var allRules = /* @__PURE__ */ new Set();
var eventRules = /* @__PURE__ */ new Map();
var cssStyleRules = /* @__PURE__ */ new Set();
var eventTypes = /* @__PURE__ */ new Set();
function addRules(target, triggers, actions) {
  const rules = [];
  for (const trigger of triggers) {
    for (const action of actions) {
      const rule = addRule(target, trigger, action);
      if (rule) {
        rules.push(rule);
      }
    }
  }
  return rules;
}
function addRule(target, trigger, action) {
  const rule = {
    target: new WeakRef(target),
    trigger,
    action
  };
  if (triggerBeforeEvent(document, "addRule", rule)) {
    const eventType = rule.trigger.eventType;
    let targetRules = eventRules.get(eventType);
    if (!targetRules) {
      targetRules = /* @__PURE__ */ new WeakMap();
      eventRules.set(eventType, targetRules);
    }
    let rules = targetRules.get(target);
    if (!rules) {
      rules = /* @__PURE__ */ new Set();
      targetRules.set(target, rules);
    }
    rules.add(rule);
    allRules.add(rule);
    if (target instanceof CSSStyleRule) {
      cssStyleRules.add(target);
    }
    if (!eventTypes.has(eventType)) {
      const detail = { eventType };
      if (triggerBeforeEvent(document, "addEventType", detail)) {
        eventTypes.add(eventType);
        document.addEventListener(eventType, eventListener);
        triggerAfterEvent(document, "addEventType", detail);
      }
    }
    triggerAfterEvent(document, "addRule", rule);
    return rule;
  }
}
function removeRules(target) {
  const removedRules = [];
  for (const targetRules of eventRules.values()) {
    const rules = targetRules.get(target);
    if (rules) {
      for (const rule of rules) {
        removedRules.push(rule);
        allRules.delete(rule);
      }
      rules.clear();
      targetRules.delete(target);
      if (target instanceof CSSStyleRule) {
        cssStyleRules.delete(target);
      }
    }
  }
  return removedRules;
}
function getRules() {
  return allRules.values();
}
function eventListener(event) {
  console.log("EVENT", event.type, event);
  if (event.target instanceof Element) {
    const targetRules = eventRules.get(event.type);
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;
    if (targetRules) {
      triggerRules(targetRules, event.target, event.target);
      for (const cssStyleRule of cssStyleRules) {
        if (isEnabled(cssStyleRule)) {
          if (event.target.matches(cssStyleRule.selectorText)) {
            triggerRules(targetRules, cssStyleRule, event.target);
          }
          if (recursive) {
            for (const elt of event.target.querySelectorAll(cssStyleRule.selectorText)) {
              triggerRules(targetRules, cssStyleRule, elt);
            }
          }
        }
      }
    }
  }
}
function isEnabled(styleRule) {
  return !!styleRule.parentStyleSheet && !styleRule.parentStyleSheet.disabled;
}
function triggerRules(targetRules, ruleTarget, eventTarget) {
  if (eventTarget instanceof Element) {
    const rules = targetRules.get(ruleTarget);
    if (rules) {
      for (const rule of rules) {
        triggerRule(rule, eventTarget);
      }
    }
  }
}

// lib/parse_triggers.ts
var WHITESPACE_OR_COMMA = /[\s,]/;
var SYMBOL_START = /[_$a-zA-Z]/;
var SYMBOL_CONT = /[_$a-zA-Z0-9]/;
var STRINGISH_START = ['"', "'", "/"];
var NOT_WHITESPACE = /[^\s]/;
var INPUT_SELECTOR = "input, textarea, select";
function parseTriggers(target, triggerValue, defaultEventType = "click") {
  const triggerSpecs = [];
  const elt = target instanceof Element ? target : target.parentStyleSheet?.ownerNode instanceof Element ? target.parentStyleSheet.ownerNode : void 0;
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
              triggerErrorEvent(elt ?? document, "triggerSyntax", {
                token: tokens.shift()
              });
            }
          }
          triggerSpecs.push(triggerSpec);
        }
      }
      if (tokens.length === initialLength) {
        triggerErrorEvent(elt ?? document, "triggerSyntax", {
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

// lib/process_element.ts
function processElement(elt) {
  if (hasAhxAttributes(elt)) {
    if (triggerBeforeEvent(elt, "processElement", {})) {
      const triggers = parseTriggers(
        elt,
        elt.getAttribute(`${config.prefix}-trigger`) ?? ""
      );
      const actions = parseActions(elt);
      const addedRules = addRules(elt, triggers, actions);
      triggerAfterEvent(elt, "processElement", {
        addedRules,
        removedRules: []
      });
      return addedRules;
    }
  }
  return [];
}

// lib/start_observer.ts
function startObserver(root) {
  const observer = new MutationObserver((mutations) => {
    const detail = { mutations };
    if (triggerBeforeEvent(root, "mutations", detail)) {
      const removedRules = [];
      const addedRules = [];
      const removedElements = [];
      const addedElements = [];
      for (const mutation of detail.mutations) {
        for (const node of mutation.removedNodes) {
          if (node instanceof Element) {
            removedRules.push(...removeRules(node));
            removedElements.push(node);
          }
        }
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            addedRules.push(...processElement(node));
            addedElements.push(node);
          }
        }
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          removedRules.push(...removeRules(mutation.target));
          addedRules.push(...processElement(mutation.target));
        }
      }
      triggerAfterEvent(root, "mutations", {
        ...detail,
        removedRules,
        addedRules,
        removedElements,
        addedElements
      });
    }
  });
  const options = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true
  };
  if (triggerBeforeEvent(root, "startObserver", options)) {
    observer.observe(root, options);
    triggerAfterEvent(root, "startObserver", options);
  }
}

// lib/logger.ts
function logAll(root = document) {
  config.enableAhxCombinedEvent = true;
  root.addEventListener(config.prefix, (event) => {
    if (event instanceof CustomEvent && event.detail instanceof CustomEvent) {
      event = event.detail;
    }
    const detail = event.detail;
    if (detail?._before) {
      console.group(event.type, event, detail);
    } else {
      console.log(event.type, event, detail);
    }
    if (detail?._after) {
      console.groupEnd();
    }
  });
}

// lib/process_tree.ts
function processTree(root) {
  const detail = {
    selector: ahxSelector()
  };
  if (triggerBeforeEvent(root, "processTree", detail)) {
    const addedRules = [];
    const elements = root.querySelectorAll(detail.selector);
    for (const elt of elements) {
      addedRules.push(...processElement(elt));
    }
    triggerAfterEvent(root, "processTree", {
      ...detail,
      addedRules,
      removedRules: []
    });
    return addedRules;
  }
  return [];
}

// lib/style_props.ts
function getStyleProps(rule) {
  const props = /* @__PURE__ */ new Set();
  for (const prop of rule.style) {
    if (isAhxProp(prop)) {
      props.add(prop);
    }
  }
  return props;
}
function isAhxProp(prop) {
  return prop.startsWith(`--${config.prefix}-`) || config.customProps.includes(prop);
}

// lib/process_style_rule.ts
function processStyleRule(rule, props = getStyleProps(rule)) {
  const value = getAhxValue(rule, "trigger");
  const triggers = parseTriggers(rule, value, "default");
  const actions = getActionSpecs(rule, props);
  return addRules(rule, triggers, actions);
}
function getActionSpecs(rule, props) {
  const actionSpecs = [];
  for (const method of config.httpMethods) {
    const prop = `--${config.prefix}-${method}`;
    if (props.has(prop)) {
      const url = parseCssValue({ rule, prop }).value;
      if (url) {
        actionSpecs.push({
          type: "request",
          method,
          url
        });
      }
    }
  }
  return actionSpecs;
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
    const props = getStyleProps(rule);
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
var importLinks = /* @__PURE__ */ new WeakMap();
function processCssImports(rule, props) {
  let imported = false;
  const importProp = `--${config.prefix}-import`;
  for (const prop of props) {
    if (prop === importProp || prop.startsWith(`${importProp}-`)) {
      if (!importLinks.has(rule)) {
        importLinks.set(rule, /* @__PURE__ */ new Map());
      }
      let link = importLinks.get(rule)?.get(prop);
      let ruleApplies = false;
      for (const elt of document.querySelectorAll(rule.selectorText)) {
        const url = parseCssValue({ rule, prop, elt }).value;
        if (url) {
          ruleApplies = true;
          if (link) {
            if (link.sheet && link.sheet.disabled) {
              link.sheet.disabled = false;
              imported = "enabled";
            }
            break;
          } else {
            link = createStyleSheetLink(
              url,
              rule.parentStyleSheet?.ownerNode?.crossOrigin ?? void 0
            );
            if (link) {
              importLinks.get(rule)?.set(prop, link);
              imported = "created";
              break;
            }
          }
        }
      }
      if (!ruleApplies && link && link.sheet && !link.sheet.disabled) {
        link.sheet.disabled = true;
        imported = "disabled";
      }
    }
  }
  return imported;
}
function createStyleSheetLink(url, crossOrigin) {
  const detail = { url, crossOrigin, disabled: false };
  if (triggerBeforeEvent(document, "cssImport", detail)) {
    if (!document.querySelector(`link[rel="stylesheet"][href="${detail.url}"]`)) {
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", detail.url);
      if (typeof detail.crossOrigin === "string") {
        link.setAttribute("crossorigin", detail.crossOrigin);
      }
      link.addEventListener("load", (event) => {
        triggerAfterEvent(event.target ?? document, "cssImport", detail);
      }, { once: true, passive: true });
      document.head.appendChild(link);
      return link;
    }
  }
}

// lib/create_pseudo_elements.ts
var pseudoIds = /* @__PURE__ */ new WeakMap();
var nextPseudoId = 1;
function createPseudoElements(rule) {
  const before = rule.selectorText.includes("::before");
  const after = before ? false : rule.selectorText.includes("::after");
  let modified = false;
  if (before || after) {
    const pseudoId = pseudoIds.get(rule) || nextPseudoId++;
    const place = before ? "before" : "after";
    const parentSelector = rule.selectorText.replace(`::${place}`, "");
    for (const elt of document.querySelectorAll(parentSelector)) {
      if (createPseudoElement(elt, pseudoId, place)) {
        modified = true;
      }
    }
    if (createPseudoRule(rule, pseudoId, place)) {
      modified = true;
    }
  }
  return modified;
}
function createPseudoElement(elt, pseudoId, place) {
  const pseudoIdClass = `${config.prefix}-pseudo-${pseudoId}`;
  if (!elt.querySelector(`:scope > .${pseudoIdClass}`)) {
    const parentTag = elt.localName;
    let pseudoTag = config.pseudoChildTags[parentTag];
    if (pseudoTag === null) {
      triggerErrorEvent(elt, "pseudoElementNotPermitted", { parentTag });
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
    if (triggerBeforeEvent(elt, "pseudoElement", detail)) {
      const insertPosition = detail.place === "before" ? "afterbegin" : "beforeend";
      elt.insertAdjacentElement(insertPosition, detail.pseudoElt);
      triggerAfterEvent(elt, "pseudoElement", detail);
      return true;
    }
  }
  return false;
}
function createPseudoRule(rule, pseudoId, place) {
  if (!pseudoIds.has(rule)) {
    pseudoIds.set(rule, pseudoId);
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
    if (triggerBeforeEvent(document, "pseudoRule", detail)) {
      const styleSheet = detail.pseudoRule.parentStyleSheet;
      if (styleSheet) {
        const cssRules = styleSheet.cssRules;
        const pseudoRule2 = cssRules[styleSheet.insertRule(detail.pseudoRule.cssText, cssRules.length)];
        const addedRules = processStyleRule(pseudoRule2);
        triggerAfterEvent(document, "pseudoRule", {
          ...detail,
          pseudoRule: pseudoRule2,
          addedRules,
          removedRules: []
        });
        return true;
      }
    }
  }
  return false;
}

// lib/process_stylesheets.ts
function processStyleSheets(root) {
  let hasToggledImports = false;
  let loop = 0;
  const detail = {
    cssRules: findStyleRules(root)
  };
  const addedRules = [];
  if (!triggerBeforeEvent(root, "processStyleSheets", detail)) {
    return;
  }
  do {
    const cssRules = detail.cssRules;
    if (!cssRules) {
      return;
    }
    console.debug("processStyleSheets loop:", loop);
    let hasNewImports = false;
    for (const [rule, props] of cssRules) {
      switch (processCssImports(rule, props)) {
        case "created":
          hasNewImports = true;
          break;
        case "enabled":
        case "disabled":
          hasToggledImports = true;
          break;
      }
    }
    if (hasNewImports) {
      return;
    }
    for (const [rule] of cssRules) {
      createPseudoElements(rule);
    }
    for (const [rule, props] of cssRules) {
      addedRules.push(...processStyleRule(rule, props));
    }
    loop++;
  } while (loop < config.maxLoopCount && hasToggledImports);
  triggerAfterEvent(document, "processStyleSheets", {
    ...detail,
    addedRules,
    removedRules: []
  });
  if (loop === config.maxLoopCount) {
    console.error("ahx css rules: exceeded maximum loop count", loop);
  }
}

// lib/trigger_load.ts
function initLoadTriggerHandling(document2) {
  document2.addEventListener(`${config.prefix}:addEventType`, (event) => {
    if (event.detail.eventType === "load") {
      document2.addEventListener(`${config.prefix}:addRule:done`, (event2) => {
        if (event2.detail.trigger.eventType === "load") {
          const target = event2.detail.target.deref();
          if (target instanceof Element) {
            target.dispatchEvent(new CustomEvent("load", {
              bubbles: true
            }));
          }
        }
      });
      document2.addEventListener(`${config.prefix}:processTree:done`, (event2) => {
        if (event2.target) {
          const target = event2.target instanceof Document ? event2.target.documentElement : event2.target;
          target.dispatchEvent(new CustomEvent("load", {
            bubbles: true,
            detail: {
              recursive: true
            }
          }));
        }
      });
      document2.addEventListener(`${config.prefix}:mutations:done`, (event2) => {
        for (const elt of event2.detail.addedElements) {
          elt.dispatchEvent(new CustomEvent("load", {
            bubbles: true
          }));
        }
      });
    }
  });
}

// lib/debug.ts
var debug_exports = {};
__export(debug_exports, {
  logRules: () => logRules
});
function logRules() {
  console.group("AHX Rules");
  for (const rule of getRules()) {
    const { eventType, ...trigger } = rule.trigger;
    console.log(eventType, rule.target.deref(), trigger, rule.action);
  }
  console.groupEnd();
}

// lib/ahx.ts
ready((document2) => {
  logAll(document2);
  initLoadTriggerHandling(document2);
  processStyleSheets(document2);
  startObserver(document2);
  processTree(document2);
});
window.ahx = debug_exports;
