import type { ActionConstruct } from "@ahx/types";
import { getFormDetails } from "@ahx/common/form-details.ts";

const form: ActionConstruct = () => {
  return ({ initialTarget }) => getFormDetails(initialTarget);
};

export default form;
