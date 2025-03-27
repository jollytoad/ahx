import type { ActionContext } from "@ahx/types";

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
  return;
}

function isHtmlResponse(response?: Response): response is Response {
  return !!response && response.ok &&
    !!response.headers.get("content-type")?.includes("text/html");
}
