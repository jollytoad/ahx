export function isNode(
  node,
  nodeType,
) {
  return nodeType
    ? (node)?.nodeType === nodeType
    : !!(node)?.nodeType;
}

export function isElement(
  node,
  elementName,
) {
  return isNode(node, 1) &&
    (elementName ? (node).localName === elementName : true);
}

export function isAttr(node) {
  return isNode(node, 2);
}

export function isDocument(node) {
  return isNode(node, 9);
}

export function isDocumentFragment(node) {
  return isNode(node, 11);
}

export function isShadowRoot(node) {
  return isDocumentFragment(node) && "mode" in node && "host" in node;
}

export function isCSSStyleRule(node) {
  return typeof (node)?.style === "object";
}
