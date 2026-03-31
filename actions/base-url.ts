import type { ActionConstruct } from "@ahx/types/action.ts";

export const baseUrl: ActionConstruct = (...args) => {
  const [baseURL] = args;

  if (!baseURL) {
    throw new TypeError("A url or keyword (@control, @target) is required");
  }

  return () => {
    return { baseURL };
  };
};

export default baseUrl;
