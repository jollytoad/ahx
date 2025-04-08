export type RootNode = ParentNode;
export type SourceElement = Element;
export type SourceRule = CSSStyleRule | { selectorText: string };
export type ControlNodes = Iterable<Node>;
export type TargetNodes = Node[];
export type PayloadNodes =
  | Array<Node>
  | NodeList
  | Iterable<Node>
  | AsyncIterable<Node>;
