import { stream } from "./_stream.ts";
import { parse } from "@std/path/parse";

export default stream(index);

async function* index() {
  try {
    const dir = Deno.readDir(new URL(import.meta.resolve("./")));
    for await (const entry of dir) {
      const { ext, base, name } = parse(entry.name);
      if (ext === ".html" && !name.startsWith("_")) {
        yield `<li><a href="/examples/${base}">${name}</a></li>\n`;
      }
    }
  } catch (e) {
    console.error(e);
    yield `<li>Failed to load list of examples, check the console for errors.</li>\n`;
  }
}
