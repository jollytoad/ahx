declare interface Idiomorph {
  morph: (
    oldNode: Element | Document,
    newContent?: string | Node | Iterable<Node> | null,
    options?: {
      morphStyle?: "innerHTML" | "outerHTML";
      ignoreActive?: boolean;
      ignoreActiveValue?: boolean;
      head?: {
        style?: "merge" | "append" | "morph" | "none";
      };
      callbacks?: {
        beforeNodeAdded: (node: Node) => void | boolean;
        afterNodeAdded: (node: Node) => void;
        beforeNodeMorphed: (
          oldNode: Node,
          newNode: Node,
        ) => void | boolean;
        afterNodeMorphed: (oldNode: Node, newNode: Node) => void;
        beforeNodeRemoved: (node: Node) => void | boolean;
        afterNodeRemoved: (node: Node) => void;
      };
    },
  ) => undefined | Iterable<ChildNode>;
}

declare let Idiomorph: Idiomorph;
