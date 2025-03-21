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
  yield `<span on-oob="target .mode |> swap inner">${mode}</span>`;

  // Fill all slots with a loading indicator ('...')
  yield `<span on-oob="target .thing |> swap inner" class="loading">...</span>`;

  // Ensure the above is swapped whilst waiting
  yield `<span on-oob="swap delete">flush</span>`;

  // Simulate an initial delay for a data query
  await new Promise((resolve) => setTimeout(resolve, 300));

  for (let i = 1; i <= 9; i++) {
    const show = (odd && i % 2 === 1) || (even && i % 2 === 0);

    if (show) {
      // Fill a specific slot
      yield `<span on-oob="target .thing-${i} |> swap inner">Thing ${i}</span>`;

      // Ensure the slot is swapped whilst waiting for the next
      yield `<span on-oob="swap delete">flush</span>`;

      // Simulate a slow stream of data from the query with a small delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Clear all remaining loading indicators
  yield `<span on-oob="target .thing :has(.loading) |> swap inner"></span>`;
}
