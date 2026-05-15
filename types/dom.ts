export type RootNode = ParentNode;
export type SourceElement = Element;
export type CSSNode = {
  selectorText: string;
  parentRule: CSSNode;
};
export type SourceRule = CSSStyleRule | CSSNode;
export type ControlNodes = Iterable<Node>;
export type TargetNodes = Node[];
export type PayloadNodes =
  | Array<Node>
  | NodeList
  | Iterable<Node>
  | AsyncIterable<Node>;
