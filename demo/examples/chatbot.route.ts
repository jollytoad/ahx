import { stream } from "./_stream.ts";

export default stream(chatty);

async function* chatty() {
  yield `<!DOCTYPE html>`;

  yield `<div class="msg" data-testid="msg">`;
  yield `  <div>`;
  yield `    <span>Jollytoad says...&nbsp;</span>`;
  yield `    <span class="msg-control" data-testid="control"><a>Stop</a></span>`;
  yield `  </div>`;
  yield `  <div class="msg-content" data-testid="content"></div>`;
  yield `</div>`;

  // Set a new target for all following top-level elements
  yield `<span on-ready="target .msg-content |> swap inner"></span>`;

  for (let i = 0; i < 20; i++) {
    yield `<span on-ready="target .msg-content |> swap beforeend">blah-${i} </span>`;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  yield `<a on-ready="target .msg-control |> swap inner">Retry</a>`;

  // Revert the target for following top-level elements
  // TODO

  yield `<div on-ready="target .msg |> swap afterend" data-testid="done">Done (should be outside of the message div)</div>`;
}
