export function expandClassSyntax(xpath) {
  return xpath.replaceAll(
    /(?<=(?:^|::|\/)(?:\*|[a-z][a-z\-]*))((?:\.[a-zA-Z0-9\-_]+)+)/g,
    (_, classes) =>
      classes.split(".").slice(1).map((cls) =>
        `[contains(concat(' ', normalize-space(@class), ' '), ' ${cls} ')]`
      ).join(""),
  );
}

export function createExpression(
  args,
  preprocess,
) {
  if (!args.length) {
    throw new TypeError("An XPath expression is required");
  }

  let xpath = args.join(" ");
  xpath = preprocess?.(xpath) ?? xpath;

  return new XPathEvaluator().createExpression(xpath);
}

export function evaluateXPath(
  scope,
  expression,
) {
  const nodes = new Set();
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
