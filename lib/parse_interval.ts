export function parseInterval(str?: string): number | undefined {
  if (str == undefined) {
    return undefined;
  }
  if (str.slice(-2) == "ms") {
    return parseFloat(str.slice(0, -2)) || undefined;
  }
  if (str.slice(-1) == "s") {
    return (parseFloat(str.slice(0, -1)) * 1000) || undefined;
  }
  if (str.slice(-1) == "m") {
    return (parseFloat(str.slice(0, -1)) * 1000 * 60) || undefined;
  }
  return parseFloat(str) || undefined;
}
