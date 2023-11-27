import type { ActionDetail, DispatchDetail } from "./types.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { parseCssValue } from "./parse_css_value.ts";

// deno-lint-ignore require-await
export async function handleDispatch(
  props: ActionDetail & { target: Element },
) {
  const {
    source,
    action,
    target,
    control,
    sourceOwner,
    controlOwner,
    targetOwner,
  } = props;

  if (!(control instanceof CSSStyleRule) || action.type !== "dispatch") {
    return;
  }

  const [eventType] = parseCssValue("dispatch", control, source);

  if (!eventType) {
    return;
  }

  const detail: DispatchDetail = {
    source,
    target,
    control,
    sourceOwner,
    targetOwner,
    controlOwner,
    event: new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail: {},
    }),
  };

  if (dispatchBefore(source, "dispatch", detail)) {
    const cancelled = !target.dispatchEvent(detail.event);

    dispatchAfter(source, "dispatch", { ...detail, cancelled });
  }
}
