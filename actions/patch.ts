import type { ActionConstruct } from "@ahx/types";
import { fetchAction } from "@ahx/common/fetch-action.ts";

export default fetchAction("patch", true) as ActionConstruct;
