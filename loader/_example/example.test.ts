/// <reference lib="deno.ns" />

import { DOMParser } from "@b-fuze/deno-dom";
import { assertEquals } from "@std/assert";
import { exampleInit } from "./example.ts";

const doc = new DOMParser().parseFromString(
  `
<!DOCTYPE html>
<html lang="en-GB">
  <body>
    <bar-h1 data-foo="header">Hello World!</bar-h1>
    <p>Hello from <a href="https://deno.land/" data-foo="link">Deno!</a></p>
    <bar-foot>Footer</bar-foot>
  </body>
</html>
`,
  "text/html",
) as unknown as Document;

Deno.test("Example of custom feature finder and loader", async () => {
  const results = await exampleInit(doc);

  assertEquals(results, ["header", "Hello World!", "link", "Footer"]);
});
