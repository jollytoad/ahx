import { PREFIX } from "./config.ts";

const ERROR = "font-weight: bold; color: red;";
const RESET = "font-weight: normal; color: inherit;";

export function error(msg: string, err: unknown): void {
  console.error(`${PREFIX}%c%s%c %O`, ERROR, msg, RESET, err);
}
