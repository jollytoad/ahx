import type { ResponseInterceptor } from "@http/interceptor/types";

export function prerender(enabled = true): ResponseInterceptor {
  if (!enabled) return () => undefined;

  return async (req, res) => {
    if (req.headers.has("ahx-pipeline")) return;

    const contentType = res?.headers.get("content-type");

    if (res?.body && contentType?.includes("text/html")) {
      console.debug("PRERENDER");

      const [
        { DOMParser },
        { execReadyControls },
        { default: detectors },
        html,
      ] = await Promise.all([
        await import("@b-fuze/deno-dom"),
        await import("./exec-ready-controls.ts"),
        await import("./detectors.ts"),
        await res.text(),
      ]);

      const doc = new DOMParser().parseFromString(html, "text/html");

      try {
        await execReadyControls(doc, detectors, req.url);
      } catch (e) {
        console.error(e);
      }

      return new Response(
        `<!DOCTYPE html>\n` + doc.documentElement?.outerHTML,
        {
          headers: {
            "content-type": "text/html",
          },
        },
      );
    }
  };
}
