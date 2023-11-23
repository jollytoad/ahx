import { stream } from "./_stream.ts";

export default stream(slots);

async function* slots(req: Request) {
  const params = new URL(req.url).searchParams;
  const odd = params.has("odd");
  const even = params.has("even");
  const mode = [];

  if (odd) mode.push("Odd");
  if (even) mode.push("Even");
  if (!mode.length) mode.push("None");

  yield `<!DOCTYPE html>`;

  // Display the current slot 'mode' (either 'Odd' or 'Even')
  yield `<span ahx-slot="mode">${mode}</span>`;

  // Fill all slots with a loading indicator ('...')
  yield `<span ahx-slot="thing" class="ahx-loading">...</span>`;

  // Ensure the above is swapped whilst waiting
  yield `<ahx-flush></ahx-flush>`;

  // Simulate an initial delay for a data query
  await new Promise((resolve) => setTimeout(resolve, 300));

  for (let i = 1; i <= 9; i++) {
    const show = (odd && i % 2 === 1) || (even && i % 2 === 0);

    if (show) {
      // Fill a specific slot
      yield `<span ahx-slot="thing .thing-${i}">Thing ${i}</span>`;

      // Ensure the slot is swapped whilst waiting for the next
      yield `<ahx-flush></ahx-flush>`;

      // Simulate a slow stream of data from the query with a small delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Clear all remaining loading indicators
  yield `<span ahx-slot="thing :has(.ahx-loading)"></span>`;
}
