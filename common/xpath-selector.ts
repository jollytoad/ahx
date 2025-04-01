/**
 * Extend the XPath syntax to allow `.class` names
 * to be appended to an element name or wildcard.
 *
 * For example:
 *
 * `ancestor::div.something`
 *
 * The `.something` syntax is expanded to the xpath condition:
 *
 * `[contains(concat(' ', normalize-space(@class), ' '), ' something ')]`
 */
export function expandClassSyntax(xpath: string): string {
  return xpath.replaceAll(
    /(?<=(?:^|::|\/)(?:\*|[a-z][a-z\-]*))((?:\.[a-zA-Z0-9\-_]+)+)/g,
    (_, classes: string) =>
      classes.split(".").slice(1).map((cls) =>
        `[contains(concat(' ', normalize-space(@class), ' '), ' ${cls} ')]`
      ).join(""),
  );
}

export function createExpression(
  args: string[],
  preprocess?: (xpath: string) => string,
): XPathExpression {
  if (!args.length) {
    throw new TypeError("An XPath expression is required");
  }

  let xpath = args.join(" ");
  xpath = preprocess?.(xpath) ?? xpath;

  return new XPathEvaluator().createExpression(xpath);
}

export function evaluateXPath(
  scope: Node[],
  expression: XPathExpression,
): Node[] {
  const nodes = new Set<Node>();
  for (const node of scope) {
    const result = expression.evaluate(
      node,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    );
    let found = result.iterateNext();
    while (found) {
      nodes.add(found);
      found = result.iterateNext();
    }
  }
  return [...nodes];
}
