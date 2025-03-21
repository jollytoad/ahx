const DEFAULT_RE = /^[a-zA-Z][a-zA-Z0-9]*$/;

export function potentialBindings(
  parts: string[],
  validPart: RegExp = DEFAULT_RE,
): string[][] {
  let l = 0;
  while (l < parts.length && validPart.test(parts[l]!)) {
    l++;
  }
  const bindings = [];
  for (let i = l - 1; i >= 0; i--) {
    bindings.push(parts.slice(0, i + 1));
  }
  return bindings;
}
