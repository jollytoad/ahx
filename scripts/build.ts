import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { fromFileUrl } from "@std/path/from-file-url";

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
      outdir: "dist",
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
