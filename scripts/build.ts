import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";
import { fromFileUrl } from "$std/path/mod.ts";

export async function build(opts?: { watch?: boolean }) {
  const configPath = fromFileUrl(import.meta.resolve("../deno.json"));

  const ctxs = [
    await esbuild.context({
      plugins: [...denoPlugins({ configPath })],
      entryPoints: ["lib/ahx.ts"],
      bundle: true,
      minify: false,
      sourcemap: false,
      // target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
      outdir: "esm",
      format: "esm",
      logLevel: "debug",
    }),
  ];

  await Promise.all(ctxs.map((ctx) => ctx.rebuild()));

  if (opts?.watch) {
    await Promise.all(ctxs.map((ctx) => ctx.watch()));
  } else {
    esbuild.stop();
  }
}

if (import.meta.main) {
  build();
}
