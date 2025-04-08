import type { ActionContext } from "@ahx/types";
import { isNode } from "./guards.ts";

export async function getSourceNodes(
  context: ActionContext,
): Promise<Node[] | undefined> {
  if (context.nodes) {
    return Array.fromAsync(context.nodes);
  }
  if (isHtmlResponse(context.response)) {
    const text = await context.response.text();
    return [Document.parseHTMLUnsafe(text)];
  }
  if (isNode(context.event.target)) {
    return [context.event.target];
  }
  if (context.control.root) {
    return [context.control.root];
  }
  return;
}

function isHtmlResponse(response?: Response): response is Response {
  return !!response && response.ok &&
    !!response.headers.get("content-type")?.includes("text/html");
}
