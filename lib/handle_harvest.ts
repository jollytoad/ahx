import type { ActionDetail, HarvestDetail } from "./types.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { handleSwap } from "./handle_swap.ts";
import { parseCssValue } from "./parse_css_value.ts";

export async function handleHarvest(props: ActionDetail) {
  const {
    event,
    source,
    action,
    target,
    swap,
    origin,
    originOwner,
    targetOwner,
  } = props;

  if (!(origin instanceof CSSStyleRule) || action.type !== "harvest") {
    return;
  }

  const newValue =
    parseCssValue({ elt: source, rule: origin, prop: "harvest" }).value;

  if (newValue === undefined) {
    return;
  }

  const oldValue = getOldValue(event);

  const detail: HarvestDetail = {
    source,
    oldValue,
    newValue,
    origin,
    targetOwner,
    originOwner,
  };

  if (dispatchBefore(source, "harvest", detail)) {
    await handleSwap({
      ...swap,
      target,
      value: detail.newValue,
    });

    dispatchAfter(source, "harvest", detail);
  }
}

function getOldValue(event?: Event): string | undefined {
  if (event instanceof CustomEvent && "oldValue" in event.detail) {
    return event.detail.oldValue;
  }
}
