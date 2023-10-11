export function querySelectorExt(
  elt: Element,
  query?: string,
): Element | undefined {
  return _query(elt, query, false);
}

export function querySelectorAllExt(
  elt: Element,
  query?: string,
): Iterable<Element> {
  return _query(elt, query, true);
}

function _query(
  elt: Element,
  query: string | undefined,
  all: true,
): Iterable<Element>;
function _query(
  elt: Element,
  query: string | undefined,
  all: false,
): Element | undefined;
function _query(
  elt: Element,
  query: string | undefined,
  all: boolean,
): Iterable<Element> | Element | undefined {
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
      return all
        ? elt.querySelectorAll(selector)
        : elt.querySelector(selector) ?? undefined;
    case "next":
      return single(next(elt, selector));
    case "previous":
      return single(previous(elt, selector));
    case "body":
      return single(elt.ownerDocument.body);
    case "document":
    case "window":
      // for compatibility with htmx syntax, but we do not support
      // returning the document or window
      return single();
    default:
      return all
        ? elt.ownerDocument.querySelectorAll(query)
        : elt.ownerDocument.querySelector(query) ?? undefined;
  }

  function single(found?: Element | null) {
    return all ? (found ? [found] : []) : (found ?? undefined);
  }
}

function splitQuery(query: string) {
  const spaceIndex = query.indexOf(" ");
  if (spaceIndex === -1) {
    return [query, ""];
  } else {
    return [query.substring(0, spaceIndex), query.substring(spaceIndex + 1)];
  }
}

function next(start: Element, selector: string) {
  for (const elt of start.ownerDocument.querySelectorAll(selector)) {
    if (
      elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_PRECEDING
    ) {
      return elt;
    }
  }
}

function previous(start: Element, selector: string) {
  const results = start.ownerDocument.querySelectorAll(selector);
  for (let i = results.length - 1; i >= 0; i--) {
    const elt = results[i];
    if (
      elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return elt;
    }
  }
}
