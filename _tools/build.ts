#!/usr/bin/env -S deno run --allow-import --allow-env --allow-read --allow-write=.

import { resolve } from "@std/path/resolve";
import { relative } from "@std/path/relative";
import { ensureDir } from "@std/fs/ensure-dir";
import { walk } from "@std/fs/walk";
import { readDenoConfig } from "./_utils.ts";
import strip from "@fcrozatier/type-strip";

const DIST_DIR = "dist";
const EXT_DIR = "browser-ext";

const rootPath = import.meta.dirname
  ? resolve(import.meta.dirname, "..")
  : undefined;

async function buildAll() {
  await buildDist();
  await buildBrowserExt();
}

async function buildDist() {
  await buildJs({
    dest: DIST_DIR,
    skip: [
      /\/_/,
      /\/types\/?/,
    ],
  });
}

async function buildBrowserExt() {
  await buildJs({
    dest: EXT_DIR,
    remap: true,
    skip: [
      /\/_/,
      /\/types\/?/,
      /\/prerender\/?/,
    ],
  });
}

interface BuildJsOptions {
  dest: string;
  remap?: boolean;
  skip?: RegExp[];
}

async function buildJs({ dest, remap, skip }: BuildJsOptions) {
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
        for await (const entry of walk(pkgPath, { skip })) {
          const target = resolve(
            rootPath,
            dest,
            pkgDenoJson.name!,
            relative(pkgPath, entry.path),
          ).replace(/\.ts$/, ".js");

          if (entry.isDirectory) {
            ensureDir(target);
          } else {
            if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
              const tsContent = await Deno.readTextFile(entry.path);

              let newContent = strip(tsContent, {
                removeComments: true,
                pathRewriting: true,
                remapSpecifiers: remap
                  ? {
                    filePath: entry.path,
                    imports: {
                      "@ahx/": "./",
                    },
                  }
                  : undefined,
              });

              if (remap) {
                // hack to deal with dynamic imports and expressions
                newContent = newContent.replaceAll("@ahx/", "../");
              }

              // Remove excessive blank lines and first blank line
              newContent = newContent.replaceAll(/\n+/g, "\n").replace(
                /^\n/,
                "",
              );

              await write(target, newContent);
            }
          }
        }
      }
    }
  }
}

async function write(target: string, newContent: string) {
  const isEmpty = !newContent.trim();

  let oldContent = "";

  try {
    oldContent = await Deno.readTextFile(target);
  } catch {
    // ignore error
    if (isEmpty) return;
  }

  if (isEmpty) {
    console.debug("rm", relative(rootPath!, target));
    await Deno.remove(target, { recursive: true });
  } else if (newContent !== oldContent) {
    console.debug("->", relative(rootPath!, target));
    await Deno.writeTextFile(target, newContent);
  }
}

if (import.meta.main) {
  await buildAll();
}
