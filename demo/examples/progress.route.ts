import { stream } from "./_stream.ts";

export default stream(progress);

async function* progress() {
  for (let i = 0; i <= 100; i++) {
    console.log(i);

    const on = i > 0 ? `on-oob="target previous progress |> swap outer"` : "";

    yield `<progress id="progress" max="100" value="${i}" ${on}>${i}%</progress>`;

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  yield `<div>Complete!</div>`;
}
