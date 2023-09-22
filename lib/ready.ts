let isReady = false;

document.addEventListener("DOMContentLoaded", function () {
  isReady = true;
}, { once: true, passive: true });

export function ready(fn: (document: Document) => void) {
  if (isReady) {
    fn(document);
  } else {
    document.addEventListener("DOMContentLoaded", () => fn(document), {
      once: true,
      passive: true,
    });
  }
}
