import "../ext/polyfill/ReadableStream_asyncIterator.js";

import { parseSwap } from "./parse_swap.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { SwapSpec, SwapStyle } from "./types.ts";
import { HTMLBodyElementParserStream } from "../ext/HTMLBodyElementParserStream.js";
import { setOwner } from "./owner.ts";

export async function swap(
  target: Element,
  response: Response,
  owner?: string,
) {
  if (
    response.ok &&
    response.headers.get("Content-Type")?.startsWith("text/html") &&
    response.body
  ) {
    const swapSpec = parseSwap(target);

    let index = 0;
    let previous: Element | undefined;

    const elements = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new HTMLBodyElementParserStream(document));

    for await (const element of elements) {
      const detail = {
        ...swapSpec,
        element,
        previous,
        index,
        owner,
      };

      if (dispatchBefore(target, "swap", detail)) {
        const {
          element,
          previous: _previous,
          index: _index,
          owner,
          ...swapSpec
        } = detail;

        if (owner) {
          setOwner(element, owner);
        }

        if (!previous) {
          swapHandlers[swapSpec.swapStyle]?.(target, element, swapSpec);
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
  content: Element,
  swapSpec: SwapSpec,
) => void;

const swapAdjacent: SwapHandler = (target, element, spec) => {
  target.insertAdjacentElement(spec.swapStyle as InsertPosition, element);
};

const swapHandlers: Record<SwapStyle, SwapHandler> = {
  none: () => {
    // no-op
  },
  innerhtml(target, element) {
    target.replaceChildren(element);
  },
  outerhtml(target, element) {
    target.replaceWith(element);
  },
  beforebegin: swapAdjacent,
  afterbegin: swapAdjacent,
  beforeend: swapAdjacent,
  afterend: swapAdjacent,
};
