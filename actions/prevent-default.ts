import type { ActionConstruct } from "@ahx/types";

const preventDefault: ActionConstruct = () => ({ event }) => {
  event.preventDefault();
};

export default preventDefault;
