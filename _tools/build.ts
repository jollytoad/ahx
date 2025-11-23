#!/usr/bin/env -S deno run --allow-import --allow-env --allow-read --allow-write=.

import { resolve } from "@std/path/resolve";
import { relative } from "@std/path/relative";
import { ensureDir } from "@std/fs/ensure-dir";
import { walk } from "@std/fs/walk";
import { readDenoConfig } from "./_utils.ts";
import strip from "@fcrozatier/type-strip";

const rootPath = import.meta.dirname
  ? resolve(import.meta.dirname, "..")
  : undefined;

async function buildAll() {
  if (rootPath) {
    const packagesPath = resolve(rootPath, ".");

    const rootDenoJson = await readDenoConfig();

    if (!rootDenoJson) {
      throw new Error(`deno.json not found!`);
    }

    for (const workspacePath of rootDenoJson.workspace ?? []) {
      const pkgPath = resolve(packagesPath, workspacePath);
      const pkgDenoJson = await readDenoConfig(pkgPath) ?? {};

      if (pkgDenoJson.name) {
        const pkgDistPath = resolve(rootPath, "dist", pkgDenoJson.name);

        for await (const entry of walk(pkgPath)) {
          let target = resolve(pkgDistPath, relative(pkgPath, entry.path));

          if (entry.isDirectory) {
            ensureDir(target);
          } else {
            if (target.endsWith(".ts") && !target.endsWith(".d.ts")) {
              target = target.replace(/\.ts$/, ".js");

              const tsContent = await Deno.readTextFile(entry.path);

              const newContent = strip(tsContent, {
                removeComments: true,
                pathRewriting: true,
              });

              let oldContent = "";

              try {
                oldContent = await Deno.readTextFile(target);
              } catch {
                // ignore error
              }

              if (newContent !== oldContent) {
                console.debug(
                  relative(rootPath, entry.path),
                  "->",
                  relative(rootPath, target),
                );
                await Deno.writeTextFile(target, newContent);
              }
            }
          }
        }
      }
    }
  }
}

if (import.meta.main) {
  await buildAll();
}
