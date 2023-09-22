import { parseSwap } from "./parse_swap.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { SwapSpec, SwapStyle } from "./types.ts";

export async function swap(target: Element, response: Response) {
  if (
    response.ok && response.headers.get("Content-Type")?.startsWith("text/html")
  ) {
    const content = await response.text();

    const swapSpec = parseSwap(target);

    const detail = {
      ...swapSpec,
      content,
    };

    if (triggerBeforeEvent(target, "swap", detail)) {
      const { content, ...swapSpec } = detail;
      swapHandlers[swapSpec.swapStyle]?.(target, content, swapSpec);

      triggerAfterEvent(target, "swap", detail);
    }
  }
  // TODO: trigger events for non-ok response and non-html content
}

type SwapHandler = (target: Element, content: string, spec: SwapSpec) => void;

const swapAdjacent: SwapHandler = (target, content, spec) => {
  target.insertAdjacentHTML(spec.swapStyle as InsertPosition, content);
};

const swapHandlers: Record<SwapStyle, SwapHandler> = {
  none: () => {
    // no-op
  },
  innerhtml(target, content) {
    target.innerHTML = content;
  },
  outerhtml(target, content) {
    target.outerHTML = content;
  },
  beforebegin: swapAdjacent,
  afterbegin: swapAdjacent,
  beforeend: swapAdjacent,
  afterend: swapAdjacent,
};
