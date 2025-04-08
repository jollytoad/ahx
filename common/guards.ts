export function isNode<T extends Node = Node>(
  node: unknown,
  nodeType?: number,
): node is T {
  return nodeType
    ? (node as Node)?.nodeType === nodeType
    : !!(node as Node)?.nodeType;
}

export function isElement<T extends Element = Element>(
  node: unknown,
  elementName?: string,
): node is T {
  return isNode(node, 1) &&
    (elementName ? (node as Element).localName === elementName : true);
}

export function isAttr(node: unknown): node is Attr {
  return isNode<Attr>(node, 2);
}

export function isDocument(node: unknown): node is Document {
  return isNode<Document>(node, 9);
}

export function isDocumentFragment(node: unknown): node is DocumentFragment {
  return isNode<DocumentFragment>(node, 11);
}

export function isShadowRoot(node: unknown): node is ShadowRoot {
  return isDocumentFragment(node) && "mode" in node && "host" in node;
}

export function isCSSStyleRule(node: unknown): node is CSSStyleRule {
  return typeof (node as CSSStyleRule)?.style === "object";
}
