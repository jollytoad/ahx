import type { ActionConstruct } from "@ahx/types";
import { getFormDetails } from "@ahx/common/form-details.ts";

const form: ActionConstruct = () => {
  return ({ event }) => getFormDetails(event.target);
};

export default form;
