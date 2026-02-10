
import { HTMLBodyElementParserStream } from "@ahx/common/html-body-element-parser-stream.js";

export const stream = () => {
  return ({ targets, response, signal }) => {
    if (!targets || !response?.body) return;

    const nodes = response.body
      .pipeThrough(new TextDecoderStream(), { signal })
      .pipeThrough(new HTMLBodyElementParserStream(document, true), { signal });

    return { nodes };
  };
};
