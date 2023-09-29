/**
 * @template T
 * @this {ReadableStream<T>}
 */
async function* readableStreamIterator() {
  const reader = this.getReader();
  try {
    let done, value;
    do {
      ({ done, value } = await reader.read());
      if (value !== undefined) {
        yield value;
      }
    } while (!done);
  } finally {
    reader.releaseLock();
  }
}

ReadableStream.prototype[Symbol.asyncIterator] ??= readableStreamIterator;
