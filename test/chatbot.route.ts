import { stream } from "./_stream.ts";

export default stream(chatty);

async function* chatty() {
  yield `<!DOCTYPE html>`;

  yield `<div class="msg" data-testid="msg">`;
  yield `  <div>`;
  yield `    <span>Jollytoad says...&nbsp;</span>`;
  yield `    <slot ahx-slot-name="msg-control" data-testid="control"><a>Stop</a></slot>`;
  yield `  </div>`;
  yield `  <div ahx-slot-name="msg-content" data-testid="content"></div>`;
  yield `</div>`;

  // Set a new target for all following top-level elements
  yield `<ahx-target ahx-slot="msg-content" ahx-slot-swap="beforeEnd"></ahx-target>`;

  for (let i = 0; i < 20; i++) {
    yield `<span>blah </span>`;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  yield `<a ahx-slot="msg-control" ahx-slot-swap="inner">Retry</a>`;

  // Revert the target for following top-level elements
  yield `<ahx-target></ahx-target>`;

  yield `<div data-testid="done">Done (should be outside of the message div)</div>`;
}
