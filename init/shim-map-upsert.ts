Map.prototype.getOrInsert ??= function (key, defaultValue) {
  if (!this.has(key)) {
    this.set(key, defaultValue);
  }
  return this.get(key);
};

WeakMap.prototype.getOrInsert ??= Map.prototype.getOrInsert;

Map.prototype.getOrInsertComputed ??= function (key, callbackFunction) {
  if (!this.has(key)) {
    this.set(key, callbackFunction(key));
  }
  return this.get(key);
};

WeakMap.prototype.getOrInsertComputed ??= Map.prototype.getOrInsertComputed;
