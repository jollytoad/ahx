import type { ActionConstruct } from "@ahx/types";

export const url: ActionConstruct = (...args) => {
  if (!args[0]) {
    throw new TypeError("A url is required");
  }
  const url = args[0]!;

  return ({ request }) => {
    if (request instanceof Request) {
      request = undefined;
    }
    request ??= {};
    request.url = url;

    return { request };
  };
};
