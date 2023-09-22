// deno-lint-ignore-file no-var no-inner-declarations
"use strict";

// Public API
//** @type {import("./htmx").HtmxApi} */
// TODO: list all methods in public API
var htmx = {
  onLoad: onLoadHelper,
  process: processNode,
  on: addEventListenerImpl,
  off: removeEventListenerImpl,
  trigger: triggerEvent,
  ajax: ajaxHelper,
  find: find,
  findAll: findAll,
  closest: closest,
  values: function (elt, type) {
    var inputValues = getInputValues(elt, type || "post");
    return inputValues.values;
  },
  remove: removeElement,
  addClass: addClassToElement,
  removeClass: removeClassFromElement,
  toggleClass: toggleClassOnElement,
  takeClass: takeClassForElement,
  defineExtension: defineExtension,
  removeExtension: removeExtension,
  logAll: logAll,
  logNone: logNone,
  logger: null,
  config: {
    historyEnabled: true,
    historyCacheSize: 10,
    refreshOnHistoryMiss: false,
    defaultSwapStyle: "innerHTML",
    defaultSwapDelay: 0,
    defaultSettleDelay: 20,
    includeIndicatorStyles: true,
    indicatorClass: "htmx-indicator",
    requestClass: "htmx-request",
    addedClass: "htmx-added",
    settlingClass: "htmx-settling",
    swappingClass: "htmx-swapping",
    allowEval: true,
    allowScriptTags: true,
    inlineScriptNonce: "",
    attributesToSettle: ["class", "style", "width", "height"],
    withCredentials: false,
    timeout: 0,
    wsReconnectDelay: "full-jitter",
    wsBinaryType: "blob",
    disableSelector: "[hx-disable], [data-hx-disable]",
    useTemplateFragments: false,
    scrollBehavior: "smooth",
    defaultFocusScroll: false,
    getCacheBusterParam: false,
    globalViewTransitions: false,
    methodsThatUseUrlParams: ["get"],
    selfRequestsOnly: false,
  },
  parseInterval: parseInterval,
  _: internalEval,
  createEventSource: function (url) {
    return new EventSource(url, { withCredentials: true });
  },
  createWebSocket: function (url) {
    var sock = new WebSocket(url, []);
    sock.binaryType = htmx.config.wsBinaryType;
    return sock;
  },
  version: "1.9.6",
};

var VERBS = ["get", "post", "put", "delete", "patch"];
var VERB_SELECTOR = VERBS.map(function (verb) {
  return "[ahx-" + verb + "]";
}).join(", ");

//====================================================================
// Utilities
//====================================================================

/**
 * @param {HTMLElement} elt
 * @param {(e:HTMLElement) => boolean} condition
 * @returns {HTMLElement | null}
 */
function getClosestMatch(elt, condition) {
  while (elt && !condition(elt)) {
    elt = parentElt(elt);
  }

  return elt ? elt : null;
}

/**
 * @param {string} str
 * @returns {string}
 */
function getStartTag(str) {
  var tagMatcher = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
  var match = tagMatcher.exec(str);
  if (match) {
    return match[1].toLowerCase();
  } else {
    return "";
  }
}

/**
 * @param {string} resp
 * @param {number} depth
 * @returns {Element}
 */
function parseHTML(resp, depth) {
  var parser = new DOMParser();
  var responseDoc = parser.parseFromString(resp, "text/html");

  /** @type {Element} */
  var responseNode = responseDoc.body;
  while (depth > 0) {
    depth--;
    // @ts-ignore
    responseNode = responseNode.firstChild;
  }
  if (responseNode == null) {
    // @ts-ignore
    responseNode = getDocument().createDocumentFragment();
  }
  return responseNode;
}

function aFullPageResponse(resp) {
  return resp.match(/<body/);
}

/**
 * @param {string} resp
 * @returns {Element}
 */
function makeFragment(resp) {
  var partialResponse = !aFullPageResponse(resp);
  if (htmx.config.useTemplateFragments && partialResponse) {
    var documentFragment = parseHTML(
      "<body><template>" + resp + "</template></body>",
      0,
    );
    // @ts-ignore type mismatch between DocumentFragment and Element.
    // TODO: Are these close enough for htmx to use interchangeably?
    return documentFragment.querySelector("template").content;
  } else {
    var startTag = getStartTag(resp);
    switch (startTag) {
      case "thead":
      case "tbody":
      case "tfoot":
      case "colgroup":
      case "caption":
        return parseHTML("<table>" + resp + "</table>", 1);
      case "col":
        return parseHTML("<table><colgroup>" + resp + "</colgroup></table>", 2);
      case "tr":
        return parseHTML("<table><tbody>" + resp + "</tbody></table>", 2);
      case "td":
      case "th":
        return parseHTML(
          "<table><tbody><tr>" + resp + "</tr></tbody></table>",
          3,
        );
      case "script":
        return parseHTML("<div>" + resp + "</div>", 1);
      default:
        return parseHTML(resp, 0);
    }
  }
}

/**
 * @param {any} o
 * @param {string} type
 * @returns
 */
function isType(o, type) {
  return Object.prototype.toString.call(o) === "[object " + type + "]";
}

/**
 * @param {*} o
 * @returns {o is Function}
 */
function isFunction(o) {
  return isType(o, "Function");
}

/**
 * @param {*} o
 * @returns {o is Object}
 */
function isRawObject(o) {
  return isType(o, "Object");
}

/**
 * getInternalData retrieves "private" data stored by htmx within an element
 * @param {HTMLElement} elt
 * @returns {*}
 */
function getInternalData(elt) {
  var dataProp = "htmx-internal-data";
  var data = elt[dataProp];
  if (!data) {
    data = elt[dataProp] = {};
  }
  return data;
}

function isScrolledIntoView(el) {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;
  return elemTop < window.innerHeight && elemBottom >= 0;
}

function bodyContains(elt) {
  // IE Fix
  if (elt.getRootNode && elt.getRootNode() instanceof window.ShadowRoot) {
    return getDocument().body.contains(elt.getRootNode().host);
  } else {
    return getDocument().body.contains(elt);
  }
}

function splitOnWhitespace(trigger) {
  return trigger.trim().split(/\s+/);
}

function parseJSON(jString) {
  try {
    return JSON.parse(jString);
  } catch (error) {
    logError(error);
    return null;
  }
}

//==========================================================================================
// public API
//==========================================================================================

function removeElement(elt, delay) {
  elt = resolveTarget(elt);
  if (delay) {
    setTimeout(function () {
      removeElement(elt);
      elt = null;
    }, delay);
  } else {
    elt.parentElement.removeChild(elt);
  }
}

function addClassToElement(elt, clazz, delay) {
  elt = resolveTarget(elt);
  if (delay) {
    setTimeout(function () {
      addClassToElement(elt, clazz);
      elt = null;
    }, delay);
  } else {
    elt.classList && elt.classList.add(clazz);
  }
}

function removeClassFromElement(elt, clazz, delay) {
  elt = resolveTarget(elt);
  if (delay) {
    setTimeout(function () {
      removeClassFromElement(elt, clazz);
      elt = null;
    }, delay);
  } else {
    if (elt.classList) {
      elt.classList.remove(clazz);
      // if there are no classes left, remove the class attribute
      if (elt.classList.length === 0) {
        elt.removeAttribute("class");
      }
    }
  }
}

function toggleClassOnElement(elt, clazz) {
  elt = resolveTarget(elt);
  elt.classList.toggle(clazz);
}

function takeClassForElement(elt, clazz) {
  elt = resolveTarget(elt);
  forEach(elt.parentElement.children, function (child) {
    removeClassFromElement(child, clazz);
  });
  addClassToElement(elt, clazz);
}

function closest(elt, selector) {
  elt = resolveTarget(elt);
  if (elt.closest) {
    return elt.closest(selector);
  } else {
    // TODO remove when IE goes away
    do {
      if (elt == null || matches(elt, selector)) {
        return elt;
      }
    } while (elt = elt && parentElt(elt));
    return null;
  }
}

function startsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}

function endsWith(str, suffix) {
  return str.substring(str.length - suffix.length) === suffix;
}

function normalizeSelector(selector) {
  var trimmedSelector = selector.trim();
  if (startsWith(trimmedSelector, "<") && endsWith(trimmedSelector, "/>")) {
    return trimmedSelector.substring(1, trimmedSelector.length - 2);
  } else {
    return trimmedSelector;
  }
}

function querySelectorAllExt(elt, selector) {
  if (selector.indexOf("closest ") === 0) {
    return [closest(elt, normalizeSelector(selector.substr(8)))];
  } else if (selector.indexOf("find ") === 0) {
    return [find(elt, normalizeSelector(selector.substr(5)))];
  } else if (selector.indexOf("next ") === 0) {
    return [scanForwardQuery(elt, normalizeSelector(selector.substr(5)))];
  } else if (selector.indexOf("previous ") === 0) {
    return [scanBackwardsQuery(elt, normalizeSelector(selector.substr(9)))];
  } else if (selector === "document") {
    return [document];
  } else if (selector === "window") {
    return [window];
  } else if (selector === "body") {
    return [document.body];
  } else {
    return getDocument().querySelectorAll(normalizeSelector(selector));
  }
}

var scanForwardQuery = function (start, match) {
  var results = getDocument().querySelectorAll(match);
  for (var i = 0; i < results.length; i++) {
    var elt = results[i];
    if (
      elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_PRECEDING
    ) {
      return elt;
    }
  }
};

var scanBackwardsQuery = function (start, match) {
  var results = getDocument().querySelectorAll(match);
  for (var i = results.length - 1; i >= 0; i--) {
    var elt = results[i];
    if (
      elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return elt;
    }
  }
};

function querySelectorExt(eltOrSelector, selector) {
  if (selector) {
    return querySelectorAllExt(eltOrSelector, selector)[0];
  } else {
    return querySelectorAllExt(getDocument().body, eltOrSelector)[0];
  }
}

function resolveTarget(arg2) {
  if (isType(arg2, "String")) {
    return find(arg2);
  } else {
    return arg2;
  }
}

function processEventArgs(arg1, arg2, arg3) {
  if (isFunction(arg2)) {
    return {
      target: getDocument().body,
      event: arg1,
      listener: arg2,
    };
  } else {
    return {
      target: resolveTarget(arg1),
      event: arg2,
      listener: arg3,
    };
  }
}

function addEventListenerImpl(arg1, arg2, arg3) {
  ready(function () {
    var eventArgs = processEventArgs(arg1, arg2, arg3);
    eventArgs.target.addEventListener(eventArgs.event, eventArgs.listener);
  });
  var b = isFunction(arg2);
  return b ? arg2 : arg3;
}

function removeEventListenerImpl(arg1, arg2, arg3) {
  ready(function () {
    var eventArgs = processEventArgs(arg1, arg2, arg3);
    eventArgs.target.removeEventListener(eventArgs.event, eventArgs.listener);
  });
  return isFunction(arg2) ? arg2 : arg3;
}

//====================================================================
// Node processing
//====================================================================

var DUMMY_ELT = getDocument().createElement("output"); // dummy element for bad selectors
function findAttributeTargets(elt, attrName) {
  var attrTarget = getClosestAttributeValue(elt, attrName);
  if (attrTarget) {
    if (attrTarget === "this") {
      return [findThisElement(elt, attrName)];
    } else {
      var result = querySelectorAllExt(elt, attrTarget);
      if (result.length === 0) {
        logError(
          'The selector "' + attrTarget + '" on ' + attrName +
            " returned no matches!",
        );
        return [DUMMY_ELT];
      } else {
        return result;
      }
    }
  }
}

function findThisElement(elt, attribute) {
  return getClosestMatch(elt, function (elt) {
    return getAttributeValue(elt, attribute) != null;
  });
}

function getTarget(elt) {
  var targetStr = getClosestAttributeValue(elt, "hx-target");
  if (targetStr) {
    if (targetStr === "this") {
      return findThisElement(elt, "hx-target");
    } else {
      return querySelectorExt(elt, targetStr);
    }
  } else {
    var data = getInternalData(elt);
    if (data.boosted) {
      return getDocument().body;
    } else {
      return elt;
    }
  }
}

function shouldSettleAttribute(name) {
  var attributesToSettle = htmx.config.attributesToSettle;
  for (var i = 0; i < attributesToSettle.length; i++) {
    if (name === attributesToSettle[i]) {
      return true;
    }
  }
  return false;
}

function cloneAttributes(mergeTo, mergeFrom) {
  forEach(mergeTo.attributes, function (attr) {
    if (
      !mergeFrom.hasAttribute(attr.name) && shouldSettleAttribute(attr.name)
    ) {
      mergeTo.removeAttribute(attr.name);
    }
  });
  forEach(mergeFrom.attributes, function (attr) {
    if (shouldSettleAttribute(attr.name)) {
      mergeTo.setAttribute(attr.name, attr.value);
    }
  });
}

function isInlineSwap(swapStyle, target) {
  var extensions = getExtensions(target);
  for (var i = 0; i < extensions.length; i++) {
    var extension = extensions[i];
    try {
      if (extension.isInlineSwap(swapStyle)) {
        return true;
      }
    } catch (e) {
      logError(e);
    }
  }
  return swapStyle === "outerHTML";
}

/**
 * @param {string} oobValue
 * @param {HTMLElement} oobElement
 * @param {*} settleInfo
 * @returns
 */
function oobSwap(oobValue, oobElement, settleInfo) {
  var selector = "#" + getRawAttribute(oobElement, "id");
  var swapStyle = "outerHTML";
  if (oobValue === "true") {
    // do nothing
  } else if (oobValue.indexOf(":") > 0) {
    swapStyle = oobValue.substr(0, oobValue.indexOf(":"));
    selector = oobValue.substr(oobValue.indexOf(":") + 1, oobValue.length);
  } else {
    swapStyle = oobValue;
  }

  var targets = getDocument().querySelectorAll(selector);
  if (targets) {
    forEach(
      targets,
      function (target) {
        var fragment;
        var oobElementClone = oobElement.cloneNode(true);
        fragment = getDocument().createDocumentFragment();
        fragment.appendChild(oobElementClone);
        if (!isInlineSwap(swapStyle, target)) {
          fragment = oobElementClone; // if this is not an inline swap, we use the content of the node, not the node itself
        }

        var beforeSwapDetails = {
          shouldSwap: true,
          target: target,
          fragment: fragment,
        };
        if (!triggerEvent(target, "htmx:oobBeforeSwap", beforeSwapDetails)) {
          return;
        }

        target = beforeSwapDetails.target; // allow re-targeting
        if (beforeSwapDetails["shouldSwap"]) {
          swap(swapStyle, target, target, fragment, settleInfo);
        }
        forEach(settleInfo.elts, function (elt) {
          triggerEvent(elt, "htmx:oobAfterSwap", beforeSwapDetails);
        });
      },
    );
    oobElement.parentNode.removeChild(oobElement);
  } else {
    oobElement.parentNode.removeChild(oobElement);
    triggerErrorEvent(getDocument().body, "htmx:oobErrorNoTarget", {
      content: oobElement,
    });
  }
  return oobValue;
}

function handleOutOfBandSwaps(elt, fragment, settleInfo) {
  var oobSelects = getClosestAttributeValue(elt, "hx-select-oob");
  if (oobSelects) {
    var oobSelectValues = oobSelects.split(",");
    for (let i = 0; i < oobSelectValues.length; i++) {
      var oobSelectValue = oobSelectValues[i].split(":", 2);
      var id = oobSelectValue[0].trim();
      if (id.indexOf("#") === 0) {
        id = id.substring(1);
      }
      var oobValue = oobSelectValue[1] || "true";
      var oobElement = fragment.querySelector("#" + id);
      if (oobElement) {
        oobSwap(oobValue, oobElement, settleInfo);
      }
    }
  }
  forEach(
    findAll(fragment, "[hx-swap-oob], [data-hx-swap-oob]"),
    function (oobElement) {
      var oobValue = getAttributeValue(oobElement, "hx-swap-oob");
      if (oobValue != null) {
        oobSwap(oobValue, oobElement, settleInfo);
      }
    },
  );
}

function handlePreservedElements(fragment) {
  forEach(
    findAll(fragment, "[hx-preserve], [data-hx-preserve]"),
    function (preservedElt) {
      var id = getAttributeValue(preservedElt, "id");
      var oldElt = getDocument().getElementById(id);
      if (oldElt != null) {
        preservedElt.parentNode.replaceChild(oldElt, preservedElt);
      }
    },
  );
}

function handleAttributes(parentNode, fragment, settleInfo) {
  forEach(fragment.querySelectorAll("[id]"), function (newNode) {
    var id = getRawAttribute(newNode, "id");
    if (id && id.length > 0) {
      var normalizedId = id.replace("'", "\\'");
      var normalizedTag = newNode.tagName.replace(":", "\\:");
      var oldNode = parentNode.querySelector(
        normalizedTag + "[id='" + normalizedId + "']",
      );
      if (oldNode && oldNode !== parentNode) {
        var newAttributes = newNode.cloneNode();
        cloneAttributes(newNode, oldNode);
        settleInfo.tasks.push(function () {
          cloneAttributes(newNode, newAttributes);
        });
      }
    }
  });
}

function makeAjaxLoadTask(child) {
  return function () {
    removeClassFromElement(child, htmx.config.addedClass);
    processNode(child);
    processScripts(child);
    processFocus(child);
    triggerEvent(child, "htmx:load");
  };
}

function processFocus(child) {
  var autofocus = "[autofocus]";
  var autoFocusedElt = matches(child, autofocus)
    ? child
    : child.querySelector(autofocus);
  if (autoFocusedElt != null) {
    autoFocusedElt.focus();
  }
}

function insertNodesBefore(parentNode, insertBefore, fragment, settleInfo) {
  handleAttributes(parentNode, fragment, settleInfo);
  while (fragment.childNodes.length > 0) {
    var child = fragment.firstChild;
    addClassToElement(child, htmx.config.addedClass);
    parentNode.insertBefore(child, insertBefore);
    if (
      child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE
    ) {
      settleInfo.tasks.push(makeAjaxLoadTask(child));
    }
  }
}

// based on https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0,
// derived from Java's string hashcode implementation
function stringHash(string, hash) {
  var char = 0;
  while (char < string.length) {
    hash = (hash << 5) - hash + string.charCodeAt(char++) | 0; // bitwise or ensures we have a 32-bit int
  }
  return hash;
}

function attributeHash(elt) {
  var hash = 0;
  // IE fix
  if (elt.attributes) {
    for (var i = 0; i < elt.attributes.length; i++) {
      var attribute = elt.attributes[i];
      if (attribute.value) { // only include attributes w/ actual values (empty is same as non-existent)
        hash = stringHash(attribute.name, hash);
        hash = stringHash(attribute.value, hash);
      }
    }
  }
  return hash;
}

function deInitNode(element) {
  var internalData = getInternalData(element);
  if (internalData.timeout) {
    clearTimeout(internalData.timeout);
  }
  if (internalData.initHash) {
    internalData.initHash = null;
  }
}

function cleanUpElement(element) {
  triggerEvent(element, "htmx:beforeCleanupElement");
  deInitNode(element);
  if (element.children) { // IE
    forEach(element.children, function (child) {
      cleanUpElement(child);
    });
  }
}

function swapOuterHTML(target, fragment, settleInfo) {
  if (target.tagName === "BODY") {
    return swapInnerHTML(target, fragment, settleInfo);
  } else {
    // @type {HTMLElement}
    var newElt;
    var eltBeforeNewContent = target.previousSibling;
    insertNodesBefore(parentElt(target), target, fragment, settleInfo);
    if (eltBeforeNewContent == null) {
      newElt = parentElt(target).firstChild;
    } else {
      newElt = eltBeforeNewContent.nextSibling;
    }
    getInternalData(target).replacedWith = newElt; // tuck away so we can fire events on it later
    settleInfo.elts = settleInfo.elts.filter(function (e) {
      return e != target;
    });
    while (newElt && newElt !== target) {
      if (newElt.nodeType === Node.ELEMENT_NODE) {
        settleInfo.elts.push(newElt);
      }
      newElt = newElt.nextElementSibling;
    }
    cleanUpElement(target);
    parentElt(target).removeChild(target);
  }
}

function swapAfterBegin(target, fragment, settleInfo) {
  return insertNodesBefore(target, target.firstChild, fragment, settleInfo);
}

function swapBeforeBegin(target, fragment, settleInfo) {
  return insertNodesBefore(parentElt(target), target, fragment, settleInfo);
}

function swapBeforeEnd(target, fragment, settleInfo) {
  return insertNodesBefore(target, null, fragment, settleInfo);
}

function swapAfterEnd(target, fragment, settleInfo) {
  return insertNodesBefore(
    parentElt(target),
    target.nextSibling,
    fragment,
    settleInfo,
  );
}
function swapDelete(target, fragment, settleInfo) {
  cleanUpElement(target);
  return parentElt(target).removeChild(target);
}

function swapInnerHTML(target, fragment, settleInfo) {
  var firstChild = target.firstChild;
  insertNodesBefore(target, firstChild, fragment, settleInfo);
  if (firstChild) {
    while (firstChild.nextSibling) {
      cleanUpElement(firstChild.nextSibling);
      target.removeChild(firstChild.nextSibling);
    }
    cleanUpElement(firstChild);
    target.removeChild(firstChild);
  }
}

function maybeSelectFromResponse(elt, fragment, selectOverride) {
  var selector = selectOverride || getClosestAttributeValue(elt, "hx-select");
  if (selector) {
    var newFragment = getDocument().createDocumentFragment();
    forEach(fragment.querySelectorAll(selector), function (node) {
      newFragment.appendChild(node);
    });
    fragment = newFragment;
  }
  return fragment;
}

function swap(swapStyle, elt, target, fragment, settleInfo) {
  switch (swapStyle) {
    case "none":
      return;
    case "outerHTML":
      swapOuterHTML(target, fragment, settleInfo);
      return;
    case "afterbegin":
      swapAfterBegin(target, fragment, settleInfo);
      return;
    case "beforebegin":
      swapBeforeBegin(target, fragment, settleInfo);
      return;
    case "beforeend":
      swapBeforeEnd(target, fragment, settleInfo);
      return;
    case "afterend":
      swapAfterEnd(target, fragment, settleInfo);
      return;
    case "delete":
      swapDelete(target, fragment, settleInfo);
      return;
    default:
      var extensions = getExtensions(elt);
      for (var i = 0; i < extensions.length; i++) {
        var ext = extensions[i];
        try {
          var newElements = ext.handleSwap(
            swapStyle,
            target,
            fragment,
            settleInfo,
          );
          if (newElements) {
            if (typeof newElements.length !== "undefined") {
              // if handleSwap returns an array (like) of elements, we handle them
              for (var j = 0; j < newElements.length; j++) {
                var child = newElements[j];
                if (
                  child.nodeType !== Node.TEXT_NODE &&
                  child.nodeType !== Node.COMMENT_NODE
                ) {
                  settleInfo.tasks.push(makeAjaxLoadTask(child));
                }
              }
            }
            return;
          }
        } catch (e) {
          logError(e);
        }
      }
      if (swapStyle === "innerHTML") {
        swapInnerHTML(target, fragment, settleInfo);
      } else {
        swap(htmx.config.defaultSwapStyle, elt, target, fragment, settleInfo);
      }
  }
}

function findTitle(content) {
  if (content.indexOf("<title") > -1) {
    var contentWithSvgsRemoved = content.replace(
      /<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,
      "",
    );
    var result = contentWithSvgsRemoved.match(
      /<title(\s[^>]*>|>)([\s\S]*?)<\/title>/im,
    );

    if (result) {
      return result[2];
    }
  }
}

function selectAndSwap(
  swapStyle,
  target,
  elt,
  responseText,
  settleInfo,
  selectOverride,
) {
  settleInfo.title = findTitle(responseText);
  var fragment = makeFragment(responseText);
  if (fragment) {
    handleOutOfBandSwaps(elt, fragment, settleInfo);
    fragment = maybeSelectFromResponse(elt, fragment, selectOverride);
    handlePreservedElements(fragment);
    return swap(swapStyle, elt, target, fragment, settleInfo);
  }
}

function handleTrigger(xhr, header, elt) {
  var triggerBody = xhr.getResponseHeader(header);
  if (triggerBody.indexOf("{") === 0) {
    var triggers = parseJSON(triggerBody);
    for (var eventName in triggers) {
      if (triggers.hasOwnProperty(eventName)) {
        var detail = triggers[eventName];
        if (!isRawObject(detail)) {
          detail = { "value": detail };
        }
        triggerEvent(elt, eventName, detail);
      }
    }
  } else {
    var eventNames = triggerBody.split(",");
    for (var i = 0; i < eventNames.length; i++) {
      triggerEvent(elt, eventNames[i].trim(), []);
    }
  }
}

function cancelPolling(elt) {
  getInternalData(elt).cancelled = true;
}

function processPolling(elt, handler, spec) {
  var nodeData = getInternalData(elt);
  nodeData.timeout = setTimeout(function () {
    if (bodyContains(elt) && nodeData.cancelled !== true) {
      if (
        !maybeFilterEvent(
          spec,
          elt,
          makeEvent("hx:poll:trigger", {
            triggerSpec: spec,
            target: elt,
          }),
        )
      ) {
        handler(elt);
      }
      processPolling(elt, handler, spec);
    }
  }, spec.pollInterval);
}

/**
 * @param {Event} evt
 * @param {HTMLElement} elt
 * @returns
 */
function shouldCancel(evt, elt) {
  if (evt.type === "submit" || evt.type === "click") {
    if (elt.tagName === "FORM") {
      return true;
    }
    if (
      matches(elt, 'input[type="submit"], button') &&
      closest(elt, "form") !== null
    ) {
      return true;
    }
    if (
      elt.tagName === "A" && elt.href &&
      (elt.getAttribute("href") === "#" ||
        elt.getAttribute("href").indexOf("#") !== 0)
    ) {
      return true;
    }
  }
  return false;
}

function maybeFilterEvent(triggerSpec, elt, evt) {
  var eventFilter = triggerSpec.eventFilter;
  if (eventFilter) {
    try {
      return eventFilter.call(elt, evt) !== true;
    } catch (e) {
      triggerErrorEvent(getDocument().body, "htmx:eventFilter:error", {
        error: e,
        source: eventFilter.source,
      });
      return true;
    }
  }
  return false;
}

function addEventListener(elt, handler, nodeData, triggerSpec, explicitCancel) {
  var elementData = getInternalData(elt);
  var eltsToListenOn;
  if (triggerSpec.from) {
    eltsToListenOn = querySelectorAllExt(elt, triggerSpec.from);
  } else {
    eltsToListenOn = [elt];
  }
  // store the initial values of the elements, so we can tell if they change
  if (triggerSpec.changed) {
    eltsToListenOn.forEach(function (eltToListenOn) {
      var eltToListenOnData = getInternalData(eltToListenOn);
      eltToListenOnData.lastValue = eltToListenOn.value;
    });
  }
  forEach(eltsToListenOn, function (eltToListenOn) {
    var eventListener = function (evt) {
      if (!bodyContains(elt)) {
        eltToListenOn.removeEventListener(triggerSpec.trigger, eventListener);
        return;
      }
      if (explicitCancel || shouldCancel(evt, elt)) {
        evt.preventDefault();
      }
      if (maybeFilterEvent(triggerSpec, elt, evt)) {
        return;
      }
      var eventData = getInternalData(evt);
      eventData.triggerSpec = triggerSpec;
      if (eventData.handledFor == null) {
        eventData.handledFor = [];
      }
      if (eventData.handledFor.indexOf(elt) < 0) {
        eventData.handledFor.push(elt);
        if (triggerSpec.consume) {
          evt.stopPropagation();
        }
        if (triggerSpec.target && evt.target) {
          if (!matches(evt.target, triggerSpec.target)) {
            return;
          }
        }
        if (triggerSpec.once) {
          if (elementData.triggeredOnce) {
            return;
          } else {
            elementData.triggeredOnce = true;
          }
        }
        if (triggerSpec.changed) {
          var eltToListenOnData = getInternalData(eltToListenOn);
          if (eltToListenOnData.lastValue === eltToListenOn.value) {
            return;
          }
          eltToListenOnData.lastValue = eltToListenOn.value;
        }
        if (elementData.delayed) {
          clearTimeout(elementData.delayed);
        }
        if (elementData.throttle) {
          return;
        }

        if (triggerSpec.throttle) {
          if (!elementData.throttle) {
            handler(elt, evt);
            elementData.throttle = setTimeout(function () {
              elementData.throttle = null;
            }, triggerSpec.throttle);
          }
        } else if (triggerSpec.delay) {
          elementData.delayed = setTimeout(function () {
            handler(elt, evt);
          }, triggerSpec.delay);
        } else {
          triggerEvent(elt, "htmx:trigger");
          handler(elt, evt);
        }
      }
    };
    if (nodeData.listenerInfos == null) {
      nodeData.listenerInfos = [];
    }
    nodeData.listenerInfos.push({
      trigger: triggerSpec.trigger,
      listener: eventListener,
      on: eltToListenOn,
    });
    eltToListenOn.addEventListener(triggerSpec.trigger, eventListener);
  });
}

//====================================================================

function loadImmediately(elt, handler, nodeData, delay) {
  var load = function () {
    if (!nodeData.loaded) {
      nodeData.loaded = true;
      handler(elt);
    }
  };
  if (delay) {
    setTimeout(load, delay);
  } else {
    load();
  }
}

function processVerbs(elt, nodeData, triggerSpecs) {
  var explicitAction = false;
  forEach(VERBS, function (verb) {
    if (hasAttribute(elt, "hx-" + verb)) {
      var path = getAttributeValue(elt, "hx-" + verb);
      explicitAction = true;
      nodeData.path = path;
      nodeData.verb = verb;
      triggerSpecs.forEach(function (triggerSpec) {
        addTriggerHandler(elt, triggerSpec, nodeData, function (elt, evt) {
          if (closest(elt, htmx.config.disableSelector)) {
            cleanUpElement(elt);
            return;
          }
          issueAjaxRequest(verb, path, elt, evt);
        });
      });
    }
  });
  return explicitAction;
}

function addTriggerHandler(elt, triggerSpec, nodeData, handler) {
  if (triggerSpec.trigger === "load") {
    if (!maybeFilterEvent(triggerSpec, elt, makeEvent("load", { elt: elt }))) {
      loadImmediately(elt, handler, nodeData, triggerSpec.delay);
    }
  } else if (triggerSpec.pollInterval) {
    nodeData.polling = true;
    processPolling(elt, handler, triggerSpec);
  } else {
    addEventListener(elt, handler, nodeData, triggerSpec);
  }
}

function findElementsToProcess(elt) {
  if (elt.querySelectorAll) {
    var results = elt.querySelectorAll(
      VERB_SELECTOR + ", form, [type='submit'], [hx-trigger]",
    );
    return results;
  } else {
    return [];
  }
}

function initButtonTracking(elt) {
  // Handle submit buttons/inputs that have the form attribute set
  // see https://developer.mozilla.org/docs/Web/HTML/Element/button
  var form = resolveTarget("#" + getRawAttribute(elt, "form")) ||
    closest(elt, "form");
  if (!form) {
    return;
  }

  var maybeSetLastButtonClicked = function (evt) {
    var elt = closest(evt.target, "button, input[type='submit']");
    if (elt !== null) {
      var internalData = getInternalData(form);
      internalData.lastButtonClicked = elt;
    }
  };

  // need to handle both click and focus in:
  //   focusin - in case someone tabs in to a button and hits the space bar
  //   click - on OSX buttons do not focus on click see https://bugs.webkit.org/show_bug.cgi?id=13724

  elt.addEventListener("click", maybeSetLastButtonClicked);
  elt.addEventListener("focusin", maybeSetLastButtonClicked);
  elt.addEventListener("focusout", function (evt) {
    var internalData = getInternalData(form);
    internalData.lastButtonClicked = null;
  });
}

function initNode(elt) {
  var nodeData = getInternalData(elt);
  if (nodeData.initHash !== attributeHash(elt)) {
    // clean up any previously processed info
    deInitNode(elt);

    nodeData.initHash = attributeHash(elt);

    triggerEvent(elt, "htmx:beforeProcessNode");

    if (elt.value) {
      nodeData.lastValue = elt.value;
    }

    var triggerSpecs = getTriggerSpecs(elt);
    var hasExplicitHttpAction = processVerbs(elt, nodeData, triggerSpecs);

    if (!hasExplicitHttpAction) {
      if (getClosestAttributeValue(elt, "hx-boost") === "true") {
        boostElement(elt, nodeData, triggerSpecs);
      } else if (hasAttribute(elt, "hx-trigger")) {
        triggerSpecs.forEach(function (triggerSpec) {
          // For "naked" triggers, don't do anything at all
          addTriggerHandler(elt, triggerSpec, nodeData, function () {
          });
        });
      }
    }

    // Handle submit buttons/inputs that have the form attribute set
    // see https://developer.mozilla.org/docs/Web/HTML/Element/button
    if (
      elt.tagName === "FORM" ||
      (getRawAttribute(elt, "type") === "submit" && hasAttribute(elt, "form"))
    ) {
      initButtonTracking(elt);
    }

    var sseInfo = getAttributeValue(elt, "hx-sse");
    if (sseInfo) {
      processSSEInfo(elt, nodeData, sseInfo);
    }

    var wsInfo = getAttributeValue(elt, "hx-ws");
    if (wsInfo) {
      processWebSocketInfo(elt, nodeData, wsInfo);
    }
    triggerEvent(elt, "htmx:afterProcessNode");
  }
}

function processNode(elt) {
  elt = resolveTarget(elt);
  if (closest(elt, htmx.config.disableSelector)) {
    cleanUpElement(elt);
    return;
  }
  initNode(elt);
  forEach(findElementsToProcess(elt), function (child) {
    initNode(child);
  });
  // Because it happens second, the new way of adding onHandlers superseeds the old one
  // i.e. if there are any hx-on:eventName attributes, the hx-on attribute will be ignored
  forEach(findHxOnWildcardElements(elt), processHxOnWildcard);
}

function settleImmediately(tasks) {
  forEach(tasks, function (task) {
    task.call();
  });
}

function addRequestIndicatorClasses(elt) {
  var indicators = findAttributeTargets(elt, "hx-indicator");
  if (indicators == null) {
    indicators = [elt];
  }
  forEach(indicators, function (ic) {
    var internalData = getInternalData(ic);
    internalData.requestCount = (internalData.requestCount || 0) + 1;
    ic.classList["add"].call(ic.classList, htmx.config.requestClass);
  });
  return indicators;
}

function disableElements(elt) {
  var disabledElts = findAttributeTargets(elt, "hx-disabled-elts");
  if (disabledElts == null) {
    disabledElts = [];
  }
  forEach(disabledElts, function (disabledElement) {
    var internalData = getInternalData(disabledElement);
    internalData.requestCount = (internalData.requestCount || 0) + 1;
    disabledElement.setAttribute("disabled", "");
  });
  return disabledElts;
}

function removeRequestIndicators(indicators, disabled) {
  forEach(indicators, function (ic) {
    var internalData = getInternalData(ic);
    internalData.requestCount = (internalData.requestCount || 0) - 1;
    if (internalData.requestCount === 0) {
      ic.classList["remove"].call(ic.classList, htmx.config.requestClass);
    }
  });
  forEach(disabled, function (disabledElement) {
    var internalData = getInternalData(disabledElement);
    internalData.requestCount = (internalData.requestCount || 0) - 1;
    if (internalData.requestCount === 0) {
      disabledElement.removeAttribute("disabled");
    }
  });
}

//====================================================================
// Input Value Processing
//====================================================================

function haveSeenNode(processed, elt) {
  for (var i = 0; i < processed.length; i++) {
    var node = processed[i];
    if (node.isSameNode(elt)) {
      return true;
    }
  }
  return false;
}

function shouldInclude(elt) {
  if (elt.name === "" || elt.name == null || elt.disabled) {
    return false;
  }
  // ignore "submitter" types (see jQuery src/serialize.js)
  if (
    elt.type === "button" || elt.type === "submit" || elt.tagName === "image" ||
    elt.tagName === "reset" || elt.tagName === "file"
  ) {
    return false;
  }
  if (elt.type === "checkbox" || elt.type === "radio") {
    return elt.checked;
  }
  return true;
}

function addValueToValues(name, value, values) {
  // This is a little ugly because both the current value of the named value in the form
  // and the new value could be arrays, so we have to handle all four cases :/
  if (name != null && value != null) {
    var current = values[name];
    if (current === undefined) {
      values[name] = value;
    } else if (Array.isArray(current)) {
      if (Array.isArray(value)) {
        values[name] = current.concat(value);
      } else {
        current.push(value);
      }
    } else {
      if (Array.isArray(value)) {
        values[name] = [current].concat(value);
      } else {
        values[name] = [current, value];
      }
    }
  }
}

function processInputValue(processed, values, errors, elt, validate) {
  if (elt == null || haveSeenNode(processed, elt)) {
    return;
  } else {
    processed.push(elt);
  }
  if (shouldInclude(elt)) {
    var name = getRawAttribute(elt, "name");
    var value = elt.value;
    if (elt.multiple) {
      value = toArray(elt.querySelectorAll("option:checked")).map(function (e) {
        return e.value;
      });
    }
    // include file inputs
    if (elt.files) {
      value = toArray(elt.files);
    }
    addValueToValues(name, value, values);
    if (validate) {
      validateElement(elt, errors);
    }
  }
  if (matches(elt, "form")) {
    var inputs = elt.elements;
    forEach(inputs, function (input) {
      processInputValue(processed, values, errors, input, validate);
    });
  }
}

function validateElement(element, errors) {
  if (element.willValidate) {
    triggerEvent(element, "htmx:validation:validate");
    if (!element.checkValidity()) {
      errors.push({
        elt: element,
        message: element.validationMessage,
        validity: element.validity,
      });
      triggerEvent(element, "htmx:validation:failed", {
        message: element.validationMessage,
        validity: element.validity,
      });
    }
  }
}

/**
 * @param {HTMLElement} elt
 * @param {string} verb
 */
function getInputValues(elt, verb) {
  var processed = [];
  var values = {};
  var formValues = {};
  var errors = [];
  var internalData = getInternalData(elt);

  // only validate when form is directly submitted and novalidate or formnovalidate are not set
  // or if the element has an explicit hx-validate="true" on it
  var validate = (matches(elt, "form") && elt.noValidate !== true) ||
    getAttributeValue(elt, "hx-validate") === "true";
  if (internalData.lastButtonClicked) {
    validate = validate &&
      internalData.lastButtonClicked.formNoValidate !== true;
  }

  // for a non-GET include the closest form
  if (verb !== "get") {
    processInputValue(
      processed,
      formValues,
      errors,
      closest(elt, "form"),
      validate,
    );
  }

  // include the element itself
  processInputValue(processed, values, errors, elt, validate);

  // if a button or submit was clicked last, include its value
  if (
    internalData.lastButtonClicked || elt.tagName === "BUTTON" ||
    (elt.tagName === "INPUT" && getRawAttribute(elt, "type") === "submit")
  ) {
    var button = internalData.lastButtonClicked || elt;
    var name = getRawAttribute(button, "name");
    addValueToValues(name, button.value, formValues);
  }

  // include any explicit includes
  var includes = findAttributeTargets(elt, "hx-include");
  forEach(includes, function (node) {
    processInputValue(processed, values, errors, node, validate);
    // if a non-form is included, include any input values within it
    if (!matches(node, "form")) {
      forEach(node.querySelectorAll(INPUT_SELECTOR), function (descendant) {
        processInputValue(processed, values, errors, descendant, validate);
      });
    }
  });

  // form values take precedence, overriding the regular values
  values = mergeObjects(values, formValues);

  return { errors: errors, values: values };
}

function appendParam(returnStr, name, realValue) {
  if (returnStr !== "") {
    returnStr += "&";
  }
  if (String(realValue) === "[object Object]") {
    realValue = JSON.stringify(realValue);
  }
  var s = encodeURIComponent(realValue);
  returnStr += encodeURIComponent(name) + "=" + s;
  return returnStr;
}

function urlEncode(values) {
  var returnStr = "";
  for (var name in values) {
    if (values.hasOwnProperty(name)) {
      var value = values[name];
      if (Array.isArray(value)) {
        forEach(value, function (v) {
          returnStr = appendParam(returnStr, name, v);
        });
      } else {
        returnStr = appendParam(returnStr, name, value);
      }
    }
  }
  return returnStr;
}

function makeFormData(values) {
  var formData = new FormData();
  for (var name in values) {
    if (values.hasOwnProperty(name)) {
      var value = values[name];
      if (Array.isArray(value)) {
        forEach(value, function (v) {
          formData.append(name, v);
        });
      } else {
        formData.append(name, value);
      }
    }
  }
  return formData;
}

//====================================================================
// Ajax
//====================================================================

/**
 * @param {HTMLElement} elt
 * @param {HTMLElement} target
 * @param {string} prompt
 * @returns {Object} // TODO: Define/Improve HtmxHeaderSpecification
 */
function getHeaders(elt, target, prompt) {
  var headers = {
    "HX-Request": "true",
    "HX-Trigger": getRawAttribute(elt, "id"),
    "HX-Trigger-Name": getRawAttribute(elt, "name"),
    "HX-Target": getAttributeValue(target, "id"),
    "HX-Current-URL": getDocument().location.href,
  };
  getValuesForElement(elt, "hx-headers", false, headers);
  if (prompt !== undefined) {
    headers["HX-Prompt"] = prompt;
  }
  if (getInternalData(elt).boosted) {
    headers["HX-Boosted"] = "true";
  }
  return headers;
}

/**
 * filterValues takes an object containing form input values
 * and returns a new object that only contains keys that are
 * specified by the closest "hx-params" attribute
 * @param {Object} inputValues
 * @param {HTMLElement} elt
 * @returns {Object}
 */
function filterValues(inputValues, elt) {
  var paramsValue = getClosestAttributeValue(elt, "hx-params");
  if (paramsValue) {
    if (paramsValue === "none") {
      return {};
    } else if (paramsValue === "*") {
      return inputValues;
    } else if (paramsValue.indexOf("not ") === 0) {
      forEach(paramsValue.substr(4).split(","), function (name) {
        name = name.trim();
        delete inputValues[name];
      });
      return inputValues;
    } else {
      var newValues = {};
      forEach(paramsValue.split(","), function (name) {
        name = name.trim();
        newValues[name] = inputValues[name];
      });
      return newValues;
    }
  } else {
    return inputValues;
  }
}

function isAnchorLink(elt) {
  return getRawAttribute(elt, "href") &&
    getRawAttribute(elt, "href").indexOf("#") >= 0;
}

/**
 * @param {HTMLElement} elt
 * @param {string} swapInfoOverride
 * @returns {import("./htmx").HtmxSwapSpecification}
 */
function getSwapSpecification(elt, swapInfoOverride) {
  var swapInfo = swapInfoOverride
    ? swapInfoOverride
    : getClosestAttributeValue(elt, "hx-swap");
  var swapSpec = {
    "swapStyle": getInternalData(elt).boosted
      ? "innerHTML"
      : htmx.config.defaultSwapStyle,
    "swapDelay": htmx.config.defaultSwapDelay,
    "settleDelay": htmx.config.defaultSettleDelay,
  };
  if (getInternalData(elt).boosted && !isAnchorLink(elt)) {
    swapSpec["show"] = "top";
  }
  if (swapInfo) {
    var split = splitOnWhitespace(swapInfo);
    if (split.length > 0) {
      for (var i = 0; i < split.length; i++) {
        var value = split[i];
        if (value.indexOf("swap:") === 0) {
          swapSpec["swapDelay"] = parseInterval(value.substr(5));
        } else if (value.indexOf("settle:") === 0) {
          swapSpec["settleDelay"] = parseInterval(value.substr(7));
        } else if (value.indexOf("transition:") === 0) {
          swapSpec["transition"] = value.substr(11) === "true";
        } else if (value.indexOf("ignoreTitle:") === 0) {
          swapSpec["ignoreTitle"] = value.substr(12) === "true";
        } else if (value.indexOf("scroll:") === 0) {
          var scrollSpec = value.substr(7);
          var splitSpec = scrollSpec.split(":");
          var scrollVal = splitSpec.pop();
          var selectorVal = splitSpec.length > 0 ? splitSpec.join(":") : null;
          swapSpec["scroll"] = scrollVal;
          swapSpec["scrollTarget"] = selectorVal;
        } else if (value.indexOf("show:") === 0) {
          var showSpec = value.substr(5);
          var splitSpec = showSpec.split(":");
          var showVal = splitSpec.pop();
          var selectorVal = splitSpec.length > 0 ? splitSpec.join(":") : null;
          swapSpec["show"] = showVal;
          swapSpec["showTarget"] = selectorVal;
        } else if (value.indexOf("focus-scroll:") === 0) {
          var focusScrollVal = value.substr("focus-scroll:".length);
          swapSpec["focusScroll"] = focusScrollVal == "true";
        } else if (i == 0) {
          swapSpec["swapStyle"] = value;
        } else {
          logError("Unknown modifier in hx-swap: " + value);
        }
      }
    }
  }
  return swapSpec;
}

function usesFormData(elt) {
  return getClosestAttributeValue(elt, "hx-encoding") ===
      "multipart/form-data" ||
    (matches(elt, "form") &&
      getRawAttribute(elt, "enctype") === "multipart/form-data");
}

function encodeParamsForBody(xhr, elt, filteredParameters) {
  var encodedParameters = null;
  withExtensions(elt, function (extension) {
    if (encodedParameters == null) {
      encodedParameters = extension.encodeParameters(
        xhr,
        filteredParameters,
        elt,
      );
    }
  });
  if (encodedParameters != null) {
    return encodedParameters;
  } else {
    if (usesFormData(elt)) {
      return makeFormData(filteredParameters);
    } else {
      return urlEncode(filteredParameters);
    }
  }
}

/**
 * @param {Element} target
 * @returns {import("./htmx").HtmxSettleInfo}
 */
function makeSettleInfo(target) {
  return { tasks: [], elts: [target] };
}

function updateScrollState(content, swapSpec) {
  var first = content[0];
  var last = content[content.length - 1];
  if (swapSpec.scroll) {
    var target = null;
    if (swapSpec.scrollTarget) {
      target = querySelectorExt(first, swapSpec.scrollTarget);
    }
    if (swapSpec.scroll === "top" && (first || target)) {
      target = target || first;
      target.scrollTop = 0;
    }
    if (swapSpec.scroll === "bottom" && (last || target)) {
      target = target || last;
      target.scrollTop = target.scrollHeight;
    }
  }
  if (swapSpec.show) {
    var target = null;
    if (swapSpec.showTarget) {
      var targetStr = swapSpec.showTarget;
      if (swapSpec.showTarget === "window") {
        targetStr = "body";
      }
      target = querySelectorExt(first, targetStr);
    }
    if (swapSpec.show === "top" && (first || target)) {
      target = target || first;
      target.scrollIntoView({
        block: "start",
        behavior: htmx.config.scrollBehavior,
      });
    }
    if (swapSpec.show === "bottom" && (last || target)) {
      target = target || last;
      target.scrollIntoView({
        block: "end",
        behavior: htmx.config.scrollBehavior,
      });
    }
  }
}

/**
 * @param {HTMLElement} elt
 * @param {string} attr
 * @param {Object=} values
 * @returns {Object}
 */
function getValuesForElement(elt, attr, values) {
  if (values == null) {
    values = {};
  }
  if (elt == null) {
    return values;
  }
  var attributeValue = getAttributeValue(elt, attr);
  if (attributeValue) {
    var str = attributeValue.trim();
    if (str === "unset") {
      return null;
    }
    if (str.indexOf("{") !== 0) {
      str = "{" + str + "}";
    }
    var varsValues = parseJSON(str);
    for (var key in varsValues) {
      if (varsValues.hasOwnProperty(key)) {
        if (values[key] == null) {
          values[key] = varsValues[key];
        }
      }
    }
  }
  return getValuesForElement(parentElt(elt), attr, values);
}

/**
 * @param {HTMLElement} elt
 * @param {*} expressionVars
 * @returns
 */
function getHXValsForElement(elt, expressionVars) {
  return getValuesForElement(elt, "hx-vals", expressionVars);
}

/**
 * @param {HTMLElement} elt
 * @returns {Object}
 */
function getExpressionVars(elt) {
  return getHXValsForElement(elt);
}

function safelySetHeaderValue(xhr, header, headerValue) {
  if (headerValue !== null) {
    try {
      xhr.setRequestHeader(header, headerValue);
    } catch (e) {
      // On an exception, try to set the header URI encoded instead
      xhr.setRequestHeader(header, encodeURIComponent(headerValue));
      xhr.setRequestHeader(header + "-URI-AutoEncoded", "true");
    }
  }
}

function getPathFromResponse(xhr) {
  // NB: IE11 does not support this stuff
  if (xhr.responseURL && typeof URL !== "undefined") {
    try {
      var url = new URL(xhr.responseURL);
      return url.pathname + url.search;
    } catch (e) {
      triggerErrorEvent(getDocument().body, "htmx:badResponseUrl", {
        url: xhr.responseURL,
      });
    }
  }
}

function hasHeader(xhr, regexp) {
  return xhr.getAllResponseHeaders().match(regexp);
}

function ajaxHelper(verb, path, context) {
  verb = verb.toLowerCase();
  if (context) {
    if (context instanceof Element || isType(context, "String")) {
      return issueAjaxRequest(verb, path, null, null, {
        targetOverride: resolveTarget(context),
        returnPromise: true,
      });
    } else {
      return issueAjaxRequest(
        verb,
        path,
        resolveTarget(context.source),
        context.event,
        {
          handler: context.handler,
          headers: context.headers,
          values: context.values,
          targetOverride: resolveTarget(context.target),
          swapOverride: context.swap,
          returnPromise: true,
        },
      );
    }
  } else {
    return issueAjaxRequest(verb, path, null, null, {
      returnPromise: true,
    });
  }
}

function hierarchyForElt(elt) {
  var arr = [];
  while (elt) {
    arr.push(elt);
    elt = elt.parentElement;
  }
  return arr;
}

function verifyPath(elt, path, requestConfig) {
  var sameHost;
  var url;
  if (typeof URL === "function") {
    url = new URL(path, document.location.href);
    var origin = document.location.origin;
    sameHost = origin === url.origin;
  } else {
    // IE11 doesn't support URL
    url = path;
    sameHost = startsWith(path, document.location.origin);
  }

  if (htmx.config.selfRequestsOnly) {
    if (!sameHost) {
      return false;
    }
  }
  return triggerEvent(
    elt,
    "htmx:validateUrl",
    mergeObjects({ url: url, sameHost: sameHost }, requestConfig),
  );
}

function issueAjaxRequest(verb, path, elt, event, etc, confirmed) {
  var resolve = null;
  var reject = null;
  etc = etc != null ? etc : {};
  if (etc.returnPromise && typeof Promise !== "undefined") {
    var promise = new Promise(function (_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
  }
  if (elt == null) {
    elt = getDocument().body;
  }
  var responseHandler = etc.handler || handleAjaxResponse;

  if (!bodyContains(elt)) {
    // do not issue requests for elements removed from the DOM
    maybeCall(resolve);
    return promise;
  }
  var target = etc.targetOverride || getTarget(elt);
  if (target == null || target == DUMMY_ELT) {
    triggerErrorEvent(elt, "htmx:targetError", {
      target: getAttributeValue(elt, "hx-target"),
    });
    maybeCall(reject);
    return promise;
  }

  var eltData = getInternalData(elt);
  var submitter = eltData.lastButtonClicked;

  if (submitter) {
    var buttonPath = getRawAttribute(submitter, "formaction");
    if (buttonPath != null) {
      path = buttonPath;
    }

    var buttonVerb = getRawAttribute(submitter, "formmethod");
    if (buttonVerb != null) {
      verb = buttonVerb;
    }
  }

  // allow event-based confirmation w/ a callback
  if (!confirmed) {
    var issueRequest = function () {
      return issueAjaxRequest(verb, path, elt, event, etc, true);
    };
    var confirmDetails = {
      target: target,
      elt: elt,
      path: path,
      verb: verb,
      triggeringEvent: event,
      etc: etc,
      issueRequest: issueRequest,
    };
    if (triggerEvent(elt, "htmx:confirm", confirmDetails) === false) {
      maybeCall(resolve);
      return promise;
    }
  }

  var syncElt = elt;
  var syncStrategy = getClosestAttributeValue(elt, "hx-sync");
  var queueStrategy = null;
  var abortable = false;
  if (syncStrategy) {
    var syncStrings = syncStrategy.split(":");
    var selector = syncStrings[0].trim();
    if (selector === "this") {
      syncElt = findThisElement(elt, "hx-sync");
    } else {
      syncElt = querySelectorExt(elt, selector);
    }
    // default to the drop strategy
    syncStrategy = (syncStrings[1] || "drop").trim();
    eltData = getInternalData(syncElt);
    if (syncStrategy === "drop" && eltData.xhr && eltData.abortable !== true) {
      maybeCall(resolve);
      return promise;
    } else if (syncStrategy === "abort") {
      if (eltData.xhr) {
        maybeCall(resolve);
        return promise;
      } else {
        abortable = true;
      }
    } else if (syncStrategy === "replace") {
      triggerEvent(syncElt, "htmx:abort"); // abort the current request and continue
    } else if (syncStrategy.indexOf("queue") === 0) {
      var queueStrArray = syncStrategy.split(" ");
      queueStrategy = (queueStrArray[1] || "last").trim();
    }
  }

  if (eltData.xhr) {
    if (eltData.abortable) {
      triggerEvent(syncElt, "htmx:abort"); // abort the current request and continue
    } else {
      if (queueStrategy == null) {
        if (event) {
          var eventData = getInternalData(event);
          if (
            eventData && eventData.triggerSpec && eventData.triggerSpec.queue
          ) {
            queueStrategy = eventData.triggerSpec.queue;
          }
        }
        if (queueStrategy == null) {
          queueStrategy = "last";
        }
      }
      if (eltData.queuedRequests == null) {
        eltData.queuedRequests = [];
      }
      if (queueStrategy === "first" && eltData.queuedRequests.length === 0) {
        eltData.queuedRequests.push(function () {
          issueAjaxRequest(verb, path, elt, event, etc);
        });
      } else if (queueStrategy === "all") {
        eltData.queuedRequests.push(function () {
          issueAjaxRequest(verb, path, elt, event, etc);
        });
      } else if (queueStrategy === "last") {
        eltData.queuedRequests = []; // dump existing queue
        eltData.queuedRequests.push(function () {
          issueAjaxRequest(verb, path, elt, event, etc);
        });
      }
      maybeCall(resolve);
      return promise;
    }
  }

  var xhr = new XMLHttpRequest();
  eltData.xhr = xhr;
  eltData.abortable = abortable;
  var endRequestLock = function () {
    eltData.xhr = null;
    eltData.abortable = false;
    if (
      eltData.queuedRequests != null &&
      eltData.queuedRequests.length > 0
    ) {
      var queuedRequest = eltData.queuedRequests.shift();
      queuedRequest();
    }
  };
  var promptQuestion = getClosestAttributeValue(elt, "hx-prompt");
  if (promptQuestion) {
    var promptResponse = prompt(promptQuestion);
    // prompt returns null if cancelled and empty string if accepted with no entry
    if (
      promptResponse === null ||
      !triggerEvent(elt, "htmx:prompt", {
        prompt: promptResponse,
        target: target,
      })
    ) {
      maybeCall(resolve);
      endRequestLock();
      return promise;
    }
  }

  var confirmQuestion = getClosestAttributeValue(elt, "hx-confirm");
  if (confirmQuestion) {
    if (!confirm(confirmQuestion)) {
      maybeCall(resolve);
      endRequestLock();
      return promise;
    }
  }

  var headers = getHeaders(elt, target, promptResponse);
  if (etc.headers) {
    headers = mergeObjects(headers, etc.headers);
  }
  var results = getInputValues(elt, verb);
  var errors = results.errors;
  var rawParameters = results.values;
  if (etc.values) {
    rawParameters = mergeObjects(rawParameters, etc.values);
  }
  var expressionVars = getExpressionVars(elt);
  var allParameters = mergeObjects(rawParameters, expressionVars);
  var filteredParameters = filterValues(allParameters, elt);

  if (verb !== "get" && !usesFormData(elt)) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (htmx.config.getCacheBusterParam && verb === "get") {
    filteredParameters["org.htmx.cache-buster"] =
      getRawAttribute(target, "id") || "true";
  }

  // behavior of anchors w/ empty href is to use the current URL
  if (path == null || path === "") {
    path = getDocument().location.href;
  }

  var requestAttrValues = getValuesForElement(elt, "hx-request");

  var eltIsBoosted = getInternalData(elt).boosted;

  var useUrlParams = htmx.config.methodsThatUseUrlParams.indexOf(verb) >= 0;

  var requestConfig = {
    boosted: eltIsBoosted,
    useUrlParams: useUrlParams,
    parameters: filteredParameters,
    unfilteredParameters: allParameters,
    headers: headers,
    target: target,
    verb: verb,
    errors: errors,
    withCredentials: etc.credentials || requestAttrValues.credentials ||
      htmx.config.withCredentials,
    timeout: etc.timeout || requestAttrValues.timeout || htmx.config.timeout,
    path: path,
    triggeringEvent: event,
  };

  if (!triggerEvent(elt, "htmx:configRequest", requestConfig)) {
    maybeCall(resolve);
    endRequestLock();
    return promise;
  }

  // copy out in case the object was overwritten
  path = requestConfig.path;
  verb = requestConfig.verb;
  headers = requestConfig.headers;
  filteredParameters = requestConfig.parameters;
  errors = requestConfig.errors;
  useUrlParams = requestConfig.useUrlParams;

  if (errors && errors.length > 0) {
    triggerEvent(elt, "htmx:validation:halted", requestConfig);
    maybeCall(resolve);
    endRequestLock();
    return promise;
  }

  var splitPath = path.split("#");
  var pathNoAnchor = splitPath[0];
  var anchor = splitPath[1];

  var finalPath = path;
  if (useUrlParams) {
    finalPath = pathNoAnchor;
    var values = Object.keys(filteredParameters).length !== 0;
    if (values) {
      if (finalPath.indexOf("?") < 0) {
        finalPath += "?";
      } else {
        finalPath += "&";
      }
      finalPath += urlEncode(filteredParameters);
      if (anchor) {
        finalPath += "#" + anchor;
      }
    }
  }

  if (!verifyPath(elt, finalPath, requestConfig)) {
    triggerErrorEvent(elt, "htmx:invalidPath", requestConfig);
    maybeCall(reject);
    return promise;
  }

  xhr.open(verb.toUpperCase(), finalPath, true);
  xhr.overrideMimeType("text/html");
  xhr.withCredentials = requestConfig.withCredentials;
  xhr.timeout = requestConfig.timeout;

  // request headers
  if (requestAttrValues.noHeaders) {
    // ignore all headers
  } else {
    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        var headerValue = headers[header];
        safelySetHeaderValue(xhr, header, headerValue);
      }
    }
  }

  var responseInfo = {
    xhr: xhr,
    target: target,
    requestConfig: requestConfig,
    etc: etc,
    boosted: eltIsBoosted,
    pathInfo: {
      requestPath: path,
      finalRequestPath: finalPath,
      anchor: anchor,
    },
  };

  xhr.onload = function () {
    try {
      var hierarchy = hierarchyForElt(elt);
      responseInfo.pathInfo.responsePath = getPathFromResponse(xhr);
      responseHandler(elt, responseInfo);
      removeRequestIndicators(indicators, disableElts);
      triggerEvent(elt, "htmx:afterRequest", responseInfo);
      triggerEvent(elt, "htmx:afterOnLoad", responseInfo);
      // if the body no longer contains the element, trigger the event on the closest parent
      // remaining in the DOM
      if (!bodyContains(elt)) {
        var secondaryTriggerElt = null;
        while (hierarchy.length > 0 && secondaryTriggerElt == null) {
          var parentEltInHierarchy = hierarchy.shift();
          if (bodyContains(parentEltInHierarchy)) {
            secondaryTriggerElt = parentEltInHierarchy;
          }
        }
        if (secondaryTriggerElt) {
          triggerEvent(secondaryTriggerElt, "htmx:afterRequest", responseInfo);
          triggerEvent(secondaryTriggerElt, "htmx:afterOnLoad", responseInfo);
        }
      }
      maybeCall(resolve);
      endRequestLock();
    } catch (e) {
      triggerErrorEvent(
        elt,
        "htmx:onLoadError",
        mergeObjects({ error: e }, responseInfo),
      );
      throw e;
    }
  };
  xhr.onerror = function () {
    removeRequestIndicators(indicators, disableElts);
    triggerErrorEvent(elt, "htmx:afterRequest", responseInfo);
    triggerErrorEvent(elt, "htmx:sendError", responseInfo);
    maybeCall(reject);
    endRequestLock();
  };
  xhr.onabort = function () {
    removeRequestIndicators(indicators, disableElts);
    triggerErrorEvent(elt, "htmx:afterRequest", responseInfo);
    triggerErrorEvent(elt, "htmx:sendAbort", responseInfo);
    maybeCall(reject);
    endRequestLock();
  };
  xhr.ontimeout = function () {
    removeRequestIndicators(indicators, disableElts);
    triggerErrorEvent(elt, "htmx:afterRequest", responseInfo);
    triggerErrorEvent(elt, "htmx:timeout", responseInfo);
    maybeCall(reject);
    endRequestLock();
  };
  if (!triggerEvent(elt, "htmx:beforeRequest", responseInfo)) {
    maybeCall(resolve);
    endRequestLock();
    return promise;
  }
  var indicators = addRequestIndicatorClasses(elt);
  var disableElts = disableElements(elt);

  forEach(["loadstart", "loadend", "progress", "abort"], function (eventName) {
    forEach([xhr, xhr.upload], function (target) {
      target.addEventListener(eventName, function (event) {
        triggerEvent(elt, "htmx:xhr:" + eventName, {
          lengthComputable: event.lengthComputable,
          loaded: event.loaded,
          total: event.total,
        });
      });
    });
  });
  triggerEvent(elt, "htmx:beforeSend", responseInfo);
  var params = useUrlParams
    ? null
    : encodeParamsForBody(xhr, elt, filteredParameters);
  xhr.send(params);
  return promise;
}

function handleAjaxResponse(elt, responseInfo) {
  var xhr = responseInfo.xhr;
  var target = responseInfo.target;
  var etc = responseInfo.etc;
  var requestConfig = responseInfo.requestConfig;

  if (!triggerEvent(elt, "htmx:beforeOnLoad", responseInfo)) return;

  if (hasHeader(xhr, /HX-Trigger:/i)) {
    handleTrigger(xhr, "HX-Trigger", elt);
  }

  if (hasHeader(xhr, /HX-Location:/i)) {
    saveCurrentPageToHistory();
    var redirectPath = xhr.getResponseHeader("HX-Location");
    var swapSpec;
    if (redirectPath.indexOf("{") === 0) {
      swapSpec = parseJSON(redirectPath);
      // what's the best way to throw an error if the user didn't include this
      redirectPath = swapSpec["path"];
      delete swapSpec["path"];
    }
    ajaxHelper("GET", redirectPath, swapSpec).then(function () {
      pushUrlIntoHistory(redirectPath);
    });
    return;
  }

  if (hasHeader(xhr, /HX-Redirect:/i)) {
    location.href = xhr.getResponseHeader("HX-Redirect");
    return;
  }

  if (hasHeader(xhr, /HX-Refresh:/i)) {
    if ("true" === xhr.getResponseHeader("HX-Refresh")) {
      location.reload();
      return;
    }
  }

  if (hasHeader(xhr, /HX-Retarget:/i)) {
    responseInfo.target = getDocument().querySelector(
      xhr.getResponseHeader("HX-Retarget"),
    );
  }

  var historyUpdate = determineHistoryUpdates(elt, responseInfo);

  // by default htmx only swaps on 200 return codes and does not swap
  // on 204 'No Content'
  // this can be ovverriden by responding to the htmx:beforeSwap event and
  // overriding the detail.shouldSwap property
  var shouldSwap = xhr.status >= 200 && xhr.status < 400 && xhr.status !== 204;
  var serverResponse = xhr.response;
  var isError = xhr.status >= 400;
  var ignoreTitle = htmx.config.ignoreTitle;
  var beforeSwapDetails = mergeObjects({
    shouldSwap: shouldSwap,
    serverResponse: serverResponse,
    isError: isError,
    ignoreTitle: ignoreTitle,
  }, responseInfo);
  if (!triggerEvent(target, "htmx:beforeSwap", beforeSwapDetails)) return;

  target = beforeSwapDetails.target; // allow re-targeting
  serverResponse = beforeSwapDetails.serverResponse; // allow updating content
  isError = beforeSwapDetails.isError; // allow updating error
  ignoreTitle = beforeSwapDetails.ignoreTitle; // allow updating ignoring title

  responseInfo.target = target; // Make updated target available to response events
  responseInfo.failed = isError; // Make failed property available to response events
  responseInfo.successful = !isError; // Make successful property available to response events

  if (beforeSwapDetails.shouldSwap) {
    if (xhr.status === 286) {
      cancelPolling(elt);
    }

    withExtensions(elt, function (extension) {
      serverResponse = extension.transformResponse(serverResponse, xhr, elt);
    });

    // Save current page if there will be a history update
    if (historyUpdate.type) {
      saveCurrentPageToHistory();
    }

    var swapOverride = etc.swapOverride;
    if (hasHeader(xhr, /HX-Reswap:/i)) {
      swapOverride = xhr.getResponseHeader("HX-Reswap");
    }
    var swapSpec = getSwapSpecification(elt, swapOverride);

    if (swapSpec.hasOwnProperty("ignoreTitle")) {
      ignoreTitle = swapSpec.ignoreTitle;
    }

    target.classList.add(htmx.config.swappingClass);

    // optional transition API promise callbacks
    var settleResolve = null;
    var settleReject = null;

    var doSwap = function () {
      try {
        var activeElt = document.activeElement;
        var selectionInfo = {};
        try {
          selectionInfo = {
            elt: activeElt,
            // @ts-ignore
            start: activeElt ? activeElt.selectionStart : null,
            // @ts-ignore
            end: activeElt ? activeElt.selectionEnd : null,
          };
        } catch (e) {
          // safari issue - see https://github.com/microsoft/playwright/issues/5894
        }

        var selectOverride;
        if (hasHeader(xhr, /HX-Reselect:/i)) {
          selectOverride = xhr.getResponseHeader("HX-Reselect");
        }

        var settleInfo = makeSettleInfo(target);
        selectAndSwap(
          swapSpec.swapStyle,
          target,
          elt,
          serverResponse,
          settleInfo,
          selectOverride,
        );

        if (
          selectionInfo.elt &&
          !bodyContains(selectionInfo.elt) &&
          getRawAttribute(selectionInfo.elt, "id")
        ) {
          var newActiveElt = document.getElementById(
            getRawAttribute(selectionInfo.elt, "id"),
          );
          var focusOptions = {
            preventScroll: swapSpec.focusScroll !== undefined
              ? !swapSpec.focusScroll
              : !htmx.config.defaultFocusScroll,
          };
          if (newActiveElt) {
            // @ts-ignore
            if (selectionInfo.start && newActiveElt.setSelectionRange) {
              // @ts-ignore
              try {
                newActiveElt.setSelectionRange(
                  selectionInfo.start,
                  selectionInfo.end,
                );
              } catch (e) {
                // the setSelectionRange method is present on fields that don't support it, so just let this fail
              }
            }
            newActiveElt.focus(focusOptions);
          }
        }

        target.classList.remove(htmx.config.swappingClass);
        forEach(settleInfo.elts, function (elt) {
          if (elt.classList) {
            elt.classList.add(htmx.config.settlingClass);
          }
          triggerEvent(elt, "htmx:afterSwap", responseInfo);
        });

        if (hasHeader(xhr, /HX-Trigger-After-Swap:/i)) {
          var finalElt = elt;
          if (!bodyContains(elt)) {
            finalElt = getDocument().body;
          }
          handleTrigger(xhr, "HX-Trigger-After-Swap", finalElt);
        }

        var doSettle = function () {
          forEach(settleInfo.tasks, function (task) {
            task.call();
          });
          forEach(settleInfo.elts, function (elt) {
            if (elt.classList) {
              elt.classList.remove(htmx.config.settlingClass);
            }
            triggerEvent(elt, "htmx:afterSettle", responseInfo);
          });

          // if we need to save history, do so
          if (historyUpdate.type) {
            if (historyUpdate.type === "push") {
              pushUrlIntoHistory(historyUpdate.path);
              triggerEvent(getDocument().body, "htmx:pushedIntoHistory", {
                path: historyUpdate.path,
              });
            } else {
              replaceUrlInHistory(historyUpdate.path);
              triggerEvent(getDocument().body, "htmx:replacedInHistory", {
                path: historyUpdate.path,
              });
            }
          }
          if (responseInfo.pathInfo.anchor) {
            var anchorTarget = find("#" + responseInfo.pathInfo.anchor);
            if (anchorTarget) {
              anchorTarget.scrollIntoView({ block: "start", behavior: "auto" });
            }
          }

          if (settleInfo.title && !ignoreTitle) {
            var titleElt = find("title");
            if (titleElt) {
              titleElt.innerHTML = settleInfo.title;
            } else {
              window.document.title = settleInfo.title;
            }
          }

          updateScrollState(settleInfo.elts, swapSpec);

          if (hasHeader(xhr, /HX-Trigger-After-Settle:/i)) {
            var finalElt = elt;
            if (!bodyContains(elt)) {
              finalElt = getDocument().body;
            }
            handleTrigger(xhr, "HX-Trigger-After-Settle", finalElt);
          }
          maybeCall(settleResolve);
        };

        if (swapSpec.settleDelay > 0) {
          setTimeout(doSettle, swapSpec.settleDelay);
        } else {
          doSettle();
        }
      } catch (e) {
        triggerErrorEvent(elt, "htmx:swapError", responseInfo);
        maybeCall(settleReject);
        throw e;
      }
    };

    var shouldTransition = htmx.config.globalViewTransitions;
    if (swapSpec.hasOwnProperty("transition")) {
      shouldTransition = swapSpec.transition;
    }

    if (
      shouldTransition &&
      triggerEvent(elt, "htmx:beforeTransition", responseInfo) &&
      typeof Promise !== "undefined" && document.startViewTransition
    ) {
      var settlePromise = new Promise(function (_resolve, _reject) {
        settleResolve = _resolve;
        settleReject = _reject;
      });
      // wrap the original doSwap() in a call to startViewTransition()
      var innerDoSwap = doSwap;
      doSwap = function () {
        document.startViewTransition(function () {
          innerDoSwap();
          return settlePromise;
        });
      };
    }

    if (swapSpec.swapDelay > 0) {
      setTimeout(doSwap, swapSpec.swapDelay);
    } else {
      doSwap();
    }
  }
  if (isError) {
    triggerErrorEvent(
      elt,
      "htmx:responseError",
      mergeObjects({
        error: "Response Status Error Code " + xhr.status + " from " +
          responseInfo.pathInfo.requestPath,
      }, responseInfo),
    );
  }
}

function insertIndicatorStyles() {
  if (htmx.config.includeIndicatorStyles !== false) {
    getDocument().head.insertAdjacentHTML(
      "beforeend",
"<style>\
                      ." + htmx.config.indicatorClass +
"{opacity:0;transition: opacity 200ms ease-in;}\
                      ." + htmx.config.requestClass + " ." +
        htmx.config.indicatorClass + "{opacity:1}\
                      ." + htmx.config.requestClass + "." +
        htmx.config.indicatorClass + "{opacity:1}\
                    </style>",
    );
  }
}

// initialize the document
ready(function () {
  insertIndicatorStyles();
  var body = getDocument().body;
  processNode(body);
  var restoredElts = getDocument().querySelectorAll(
    "[hx-trigger='restored'],[data-hx-trigger='restored']",
  );
  body.addEventListener("htmx:abort", function (evt) {
    var target = evt.target;
    var internalData = getInternalData(target);
    if (internalData && internalData.xhr) {
      internalData.xhr.abort();
    }
  });
  var originalPopstate = window.onpopstate;
  window.onpopstate = function (event) {
    if (event.state && event.state.htmx) {
      restoreHistory();
      forEach(restoredElts, function (elt) {
        triggerEvent(elt, "htmx:restored", {
          "document": getDocument(),
          "triggerEvent": triggerEvent,
        });
      });
    } else {
      if (originalPopstate) {
        originalPopstate(event);
      }
    }
  };
  setTimeout(function () {
    triggerEvent(body, "htmx:load", {}); // give ready handlers a chance to load up before firing this event
    body = null; // kill reference for gc
  }, 0);
});
