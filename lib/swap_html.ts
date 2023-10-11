import "../ext/polyfill/ReadableStream_asyncIterator.js";

import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import type { SwapHtmlDetail, SwapHtmlProps, SwapHtmlStyle } from "./types.ts";
import { HTMLBodyElementParserStream } from "../ext/HTMLBodyElementParserStream.js";
import { setOwner } from "./util/owner.ts";

export async function swapHtml(props: SwapHtmlProps) {
  const { response, target } = props;
  if (
    response?.ok &&
    response.headers.get("Content-Type")?.startsWith("text/html") &&
    response.body
  ) {
    let index = 0;
    let previous: Element | undefined;

    const elements = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new HTMLBodyElementParserStream(document));

    for await (const element of elements) {
      const detail: SwapHtmlDetail = {
        ...props,
        swapStyle: props.swapStyle ?? "outerhtml",
        element,
        previous,
        index,
      };

      if (dispatchBefore(target, "swap", detail)) {
        const { element, originOwner, swapStyle } = detail;

        if (originOwner) {
          setOwner(element, originOwner);
        }

        if (!previous) {
          swapHandlers[swapStyle]?.(target, element);
        } else {
          previous.after(element);
        }

        previous = element;

        dispatchAfter(target, "swap", detail);
      }

      index++;
    }
  }
  // TODO: trigger events for non-ok response and non-html content
}

type SwapHandler = (
  target: Element,
  element: Element,
) => void;

const swapAdjacent =
  (pos: InsertPosition): SwapHandler => (target, element) => {
    target.insertAdjacentElement(pos, element);
  };

const swapHandlers: Record<SwapHtmlStyle, SwapHandler> = {
  innerhtml(target, element) {
    target.replaceChildren(element);
  },
  outerhtml(target, element) {
    target.replaceWith(element);
  },
  beforebegin: swapAdjacent("beforebegin"),
  afterbegin: swapAdjacent("afterbegin"),
  beforeend: swapAdjacent("beforeend"),
  afterend: swapAdjacent("afterend"),
};
