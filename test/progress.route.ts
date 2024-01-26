import { stream } from "./_stream.ts";

export default stream(progress);

async function* progress() {
  for (let i = 0; i <= 100; i++) {
    yield `<progress id="progress" max="100" value="${i}">${i}%</progress>`;

    if (i < 100) {
      yield `<ahx-replace-previous></ahx-replace-previous>`;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  yield `<div>Complete!</div>`;
}
