
import { getFormDetails } from "@ahx/common/form-details.js";

const form = () => {
  return ({ initialTarget }) => getFormDetails(initialTarget);
};

export default form;
