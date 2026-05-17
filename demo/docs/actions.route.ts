import { stream } from "./_stream.ts";
import { parse } from "@std/path/parse";

export default stream(index);

async function* index() {
  try {
    const dir = Deno.readDir(new URL(import.meta.resolve("../../actions")));
    for await (const entry of dir) {
      const { ext, base, name } = parse(entry.name);
      if (ext === ".md" && !name.startsWith("_") && name !== "README") {
        yield `<li><a href="/docs/action/${base}">${name}</a></li>\n`;
      }
    }
  } catch (e) {
    console.error(e);
    yield `<li>Failed to load list of actions, check the console for errors.</li>\n`;
  }
}
