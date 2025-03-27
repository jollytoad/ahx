#!/usr/bin/env -S deno run --allow-read=. --allow-write=.

import { resolve } from "@std/path/resolve";
import { join } from "@std/path/join";
import { join as posixJoin } from "@std/path/posix/join";
import { parse as posixParse } from "@std/path/posix/parse";
import { readDenoConfig, writeDenoConfig } from "./_utils.ts";
// import { sortByKey } from "./_utils.ts";

const rootPath = import.meta.dirname
  ? resolve(import.meta.dirname, "..")
  : undefined;

export async function updatePackages(version?: string) {
  if (rootPath) {
    const packagesPath = resolve(rootPath, ".");

    const rootDenoJson = await readDenoConfig();

    if (!rootDenoJson) {
      throw new Error(`deno.json not found!`);
    }

    rootDenoJson.workspace ??= [];

    for await (const entry of Deno.readDir(packagesPath)) {
      if (!entry.isDirectory) continue;

      const pkgPath = resolve(packagesPath, entry.name);
      const pkgDenoJson = await readDenoConfig(pkgPath) ?? {};

      if (!pkgDenoJson.name) continue;

      if (version) {
        pkgDenoJson.version = version;
      }

      const modules = await findModules(resolve(packagesPath, entry.name));

      pkgDenoJson.exports = generateExports(modules);

      await writeDenoConfig(pkgDenoJson, pkgPath);

      const workspacePath = `./${entry.name}`;

      if (!rootDenoJson.workspace.includes(workspacePath)) {
        rootDenoJson.workspace.push(workspacePath);
        rootDenoJson.workspace.sort();
      }

      // const importAlias = pkgDenoJson.name;
      // const importTarget = `jsr:${pkgDenoJson.name}@${pkgDenoJson.version}`;

      // if (rootDenoJson.imports?.[importAlias] !== importTarget) {
      //   rootDenoJson.imports = sortByKey({
      //     ...rootDenoJson.imports,
      //     [importAlias]: importTarget,
      //   });
      // }
    }

    await writeDenoConfig(rootDenoJson);
  }
}

function generateExports(modules: string[]) {
  const exports: Record<string, string> = {};

  for (const modulePath of modules) {
    if (
      !modulePath.endsWith(".ts") || modulePath.endsWith("test.ts") ||
      modulePath.endsWith("bench.ts")
    ) continue;

    const { name, dir } = posixParse(modulePath);
    const exportKey = name === "mod"
      ? (dir ? `./${dir}` : ".")
      : `./${posixJoin(dir, name)}.ts`;
    exports[exportKey] = `./${modulePath}`;
  }

  return exports;
}

async function findModules(path: string) {
  const modules: string[] = [];

  for await (const modulePath of walk(path)) {
    modules.push(modulePath);
  }

  modules.sort();

  return modules;
}

async function* walk(
  parentPath: string,
  exportPath = "",
): AsyncIterable<string> {
  for await (const entry of Deno.readDir(parentPath)) {
    if (entry.name.startsWith("_")) {
      continue;
    }

    if (entry.isDirectory) {
      yield* walk(
        join(parentPath, entry.name),
        posixJoin(exportPath, entry.name),
      );
    } else {
      yield posixJoin(exportPath, entry.name);
    }
  }
}

if (import.meta.main) {
  await updatePackages(Deno.args[0]);
}
