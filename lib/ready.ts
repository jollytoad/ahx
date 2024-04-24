export function ready(fn: (document: Document) => void) {
  if (document.readyState === "complete") {
    fn(document);
  } else {
    document.addEventListener("readystatechange", () => ready(fn), {
      once: true,
      passive: true,
    });
  }
}
