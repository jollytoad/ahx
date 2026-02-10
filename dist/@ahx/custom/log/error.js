import { PREFIX } from "@ahx/custom/log/config.js";

const ERROR = "font-weight: bold; color: red;";
const RESET = "font-weight: normal; color: inherit;";

export function error(msg, err) {
  console.error(`${PREFIX}%c%s%c %O`, ERROR, msg, RESET, err);
}
