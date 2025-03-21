import type { ActionConstruct } from "@ahx/types";
import { fetchAction } from "@ahx/common/fetch-action.ts";

export default fetchAction("post", true) as ActionConstruct;
