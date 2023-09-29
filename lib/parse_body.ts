class HTMLElementParserStream extends TransformStream<string, Element> {
  constructor(target: Document = document) {
    let doc!: Document;

    super({
      start() {
        doc = target.implementation.createHTMLDocument();
        doc.open();
      },
      transform(chunk, controller) {
        doc.write(chunk);
        while (doc.body?.childElementCount > 1) {
          const node = doc.body?.children[0];
          controller.enqueue(target.adoptNode(node));
        }
      },
      flush(controller) {
        for (const node of [...doc.body?.children]) {
          controller.enqueue(target.adoptNode(node));
        }
      },
    });
  }
}

function asAsyncIterable<T>(readable: ReadableStream<T>): AsyncIterable<T> {
  const readable_ = readable;
  if (Symbol.asyncIterator in readable_) {
    return readable;
  } else {
    const reader = readable.getReader();
    return {
      async next() {
        const { done, value } = await reader.read();
        return done ? { done, value } : { value };
      },
      async return() {
        await reader.releaseLock();
        return { done: true, value: undefined };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    } as AsyncIterableIterator<T>;
  }
}

export function parseBody(
  stream: ReadableStream<Uint8Array>,
): AsyncIterable<Element> {
  return asAsyncIterable(
    stream.pipeThrough(new TextDecoderStream())
      .pipeThrough(new HTMLElementParserStream()),
  );
}
