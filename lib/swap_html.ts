import "../ext/polyfill/ReadableStream_asyncIterator.js";

import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import type {
  SlotSpec,
  SwapHtmlDetail,
  SwapHtmlProps,
  SwapHtmlStyle,
} from "./types.ts";
import { HTMLBodyElementParserStream } from "../ext/HTMLBodyElementParserStream.js";
import { setOwner } from "./util/owner.ts";
import { config } from "./config.ts";
import { cloneInternal } from "./util/internal.ts";
import { findSlots } from "./util/slots.ts";
import { parseSlot } from "./parse_slot.ts";

export async function swapHtml(props: SwapHtmlProps) {
  const { response, target } = props;
  const document = target.ownerDocument;

  if (
    response?.ok &&
    response.headers.get("Content-Type")?.startsWith("text/html") &&
    response.body
  ) {
    let index = 0;
    let previous: Element | undefined;
    let replacePrevious = false;
    const slotSpecDefault: SlotSpec = {
      swapStyle: "inner",
    };
    let slotSpecTarget: SlotSpec = {};

    const elements = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new HTMLBodyElementParserStream(document, true));

    for await (let element of elements) {
      switch (element.localName) {
        case `${config.prefix}-target`: {
          slotSpecTarget = parseSlot(element);
          console.log("ahx-target", slotSpecTarget);
          continue;
        }
        case `${config.prefix}-replace-previous`:
          replacePrevious = true;
          continue;
        case `${config.prefix}-flush`:
          continue;
      }

      let swapStyle = props.swapStyle ?? "none";
      let targets = [target];

      const slotSpecElement = parseSlot(element);

      const slot = slotSpecElement.slot || slotSpecTarget.slot ||
        slotSpecDefault.slot;
      const selector = slotSpecElement.selector || slotSpecTarget.selector ||
        slotSpecDefault.selector;

      if (slot) {
        const slotTargets = findSlots(slot, selector, document);

        if (slotTargets.length) {
          targets = slotTargets;
          swapStyle = slotSpecElement.swapStyle || slotSpecTarget.swapStyle ||
            slotSpecDefault.swapStyle || "inner";
        } else {
          swapStyle = "none";
        }

        console.log("slots", slotTargets, swapStyle);
      }

      const templateElement = targets.length ? element : undefined;

      for (const target of targets) {
        if (templateElement) {
          element = templateElement.cloneNode(true) as typeof element;
        }

        const detail: SwapHtmlDetail = {
          ...props,
          swapStyle,
          target,
          element,
          previous,
          index,
          slot,
        };

        if (dispatchBefore(target, "swap", detail)) {
          const { target, element, controlOwner, swapStyle, slot } = detail;

          if (controlOwner) {
            setOwner(element, controlOwner);
          }

          if (slot || !previous) {
            swapHandlers[swapStyle]?.(target, element);
          } else if (previous && replacePrevious) {
            previous.replaceWith(element);
            replacePrevious = false;
          } else {
            previous.after(element);
          }

          if (!slot) {
            previous = element;
          }

          dispatchAfter(target, "swap", detail);
        }
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
  none() {
    // no-op
  },
  inner(target, element) {
    if (typeof Idiomorph !== "undefined") {
      Idiomorph.morph(target, element, {
        morphStyle: "innerHTML",
        ignoreActiveValue: true,
      });
    } else {
      target.replaceChildren(element);
    }
  },
  outer(target, element) {
    const pseudoPrefix = `${config.prefix}-pseudo`;

    for (const cls of target.classList) {
      if (cls.startsWith(pseudoPrefix)) {
        element.classList.add(cls);
      }
    }

    cloneInternal(target, element);

    if (typeof Idiomorph !== "undefined") {
      Idiomorph.morph(target, element, {
        morphStyle: "outerHTML",
        ignoreActiveValue: true,
      });
    } else {
      target.replaceWith(element);
    }
  },
  beforebegin: swapAdjacent("beforebegin"),
  afterbegin: swapAdjacent("afterbegin"),
  beforeend: swapAdjacent("beforeend"),
  afterend: swapAdjacent("afterend"),
};
