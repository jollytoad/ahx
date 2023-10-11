import { swapHtml } from "./swap_html.ts";
import { swapText } from "./swap_text.ts";
import type { SwapProps } from "./types.ts";

export async function handleSwap(props: SwapProps) {
  const { swapStyle, response, itemName } = props;
  let { value } = props;

  switch (swapStyle) {
    case "none":
      return swapNone(props);

    case "input":
    case "attr": {
      if (!itemName) {
        // TODO: consider dispatching an error
        return;
      }

      if (value === undefined && response) {
        value = await response.text();
        // TODO: handle errors
      }

      return swapText({
        ...props,
        swapStyle,
        itemName,
        value,
      });
    }

    default:
      if (isHtmlResponse(response)) {
        return swapHtml({
          ...props,
          swapStyle: swapStyle ?? "outerhtml",
          response,
        });
      }
  }
}

function swapNone(_props: SwapProps) {
  // TODO: consider whether a swap event should still be dispatched
}

function isHtmlResponse(response?: Response): response is Response {
  return !!response?.headers.get("Content-Type")?.startsWith("text/html") &&
    !!response.body;
}
