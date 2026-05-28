if (
  !Map.prototype.getOrInsert || !WeakMap.prototype.getOrInsert ||
  !Map.prototype.getOrInsertComputed || !WeakMap.prototype.getOrInsertComputed
) {
  await import("./shim-map-upsert.ts");
}

if (!ReadableStream.prototype[Symbol.asyncIterator]) {
  await import("@sec-ant/readable-stream/polyfill/asyncIterator");
}
