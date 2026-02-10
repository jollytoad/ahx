
import { isNode } from "./guards.js";

export async function getSourceNodes(
  context,
) {
  if (context.nodes) {
    return Array.fromAsync(context.nodes);
  }
  if (isHtmlResponse(context.response)) {
    const text = await context.response.text();
    return [Document.parseHTMLUnsafe(text)];
  }
  if (isNode(context.initialTarget)) {
    return [context.initialTarget];
  }
  if (context.control.root) {
    return [context.control.root];
  }
  return;
}

function isHtmlResponse(response) {
  return !!response && response.ok &&
    !!response.headers.get("content-type")?.includes("text/html");
}
