import {build} from "esbuild";

await build({
    entryPoints: ["server.mjs"],
    outfile: "build/start.mjs",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    packages: "bundle",
    sourcemap: false,
    minify: true,
    banner: {
        js: 'import {createRequire as __createRequire} from "node:module";const require=__createRequire(import.meta.url);',
    },
});
