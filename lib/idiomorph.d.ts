declare interface Idiomorph {
  morph: (oldNode: Element | Document, newContent?: string | Element | Iterable<Element> | null, options?: {
    morphStyle?: "innerHTML" | "outerHTML";
    ignoreActive?: boolean;
    ignoreActiveValue?: boolean;
    head?: {
      style?: "merge" | "append" | "morph" | "none";
    };
    callbacks?: {
      beforeNodeAdded: (node: ChildNode) => void | boolean;
      afterNodeAdded: (node: ChildNode) => void;
      beforeNodeMorphed: (oldNode: Element, newNode: Element) => void | boolean;
      afterNodeMorphed: (oldNode: Element, newNode: Element) => void;
      beforeNodeRemoved: (node: ChildNode) => void | boolean;
      afterNodeRemoved: (node: ChildNode) => void;
    };
  }) => undefined | Iterable<ChildNode>;
}

declare let Idiomorph: Idiomorph;
