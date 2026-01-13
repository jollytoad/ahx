#!/usr/bin/env -S deno run --allow-import --allow-env --allow-read --allow-net

import { createGraph } from "@deno/graph";

async function listPreloads() {
  const version = "0.5.0-alpha.12";

  const roots = [
    `jsr:@ahx/init@${version}`,
    `jsr:@ahx/features@${version}/observe/html.ts`,
    `jsr:@ahx/features@${version}/attr/on.ts`,
    `jsr:@ahx/features@${version}/cssprop/on.ts`,
    `jsr:@ahx/actions@${version}/get.ts`,
    `jsr:@ahx/actions@${version}/swap.ts`,
    `jsr:@ahx/actions@${version}/attr.ts`,
    `jsr:@ahx/actions@${version}/target.ts`,
  ].map((specifier) => import.meta.resolve(specifier));

  const graph = await createGraph(roots, {
    resolve: (specifier, referrer) => {
      if (specifier.startsWith("./") || specifier.startsWith("../")) {
        return new URL(specifier, referrer).href;
      } else {
        return import.meta.resolve(specifier);
      }
    },
  });

  const root = import.meta.resolve("../");

  return graph.modules.flatMap((m) => {
    if (m.specifier.startsWith(root)) {
      const path = m.specifier.slice(root.length, -3);
      if (!path.startsWith("types/")) {
        return [`/@ahx/${path}`];
      }
    }
    return [];
  });
}

if (import.meta.main) {
  const list = await listPreloads();
  console.log(JSON.stringify(list, null, 2));
}
