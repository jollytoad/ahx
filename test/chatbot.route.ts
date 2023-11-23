import { stream } from "./_stream.ts";

export default stream(chatty);

async function* chatty() {
  yield `<!DOCTYPE html>`;

  for (let i = 0; i <= 100; i++) {
    yield `<p>Blah blah blah ${i}%</p>`;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
