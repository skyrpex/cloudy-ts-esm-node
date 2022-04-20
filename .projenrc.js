import { typescript, javascript } from "projen";
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: "main",
  name: "@cloudy-ts/esm-node",
  bin: {
    "esm-node": "./lib/cli.js",
  },
  deps: ["esbuild", "semver", "node-fetch", "cross-spawn"],
  devDeps: ["@types/semver", "@types/cross-spawn"],
  tsconfig: {
    compilerOptions: {
      noUncheckedIndexedAccess: true,
      // Since we're using ES2020, the compiled files are almost identical to the original files. There's no need to use sourcemaps.
      inlineSourceMap: false,
      inlineSources: false,
    },
  },
  prettier: true,
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
});

// Use ESM. See https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#how-can-i-move-my-commonjs-project-to-esm.
for (const tsconfig of [project.tsconfig, project.tsconfigDev]) {
  tsconfig.file.addOverride("compilerOptions.lib", ["ES2020"]);
  tsconfig.file.addOverride("compilerOptions.target", "ES2020");
  tsconfig.file.addOverride("compilerOptions.module", "ES2020");
  tsconfig.file.addOverride("compilerOptions.moduleResolution", "node");
}
project.addDevDeps("@types/node@^14.0.0");
project.addFields({
  type: "module",
  exports: {
    ".": {
      import: `./lib/index.js`,
      types: "./lib/index.d.ts",
    },
  },
  engines: {
    node: "^14.13.1 || >=16.0.0",
  },
});

project.compileTask.prependExec(
  "yarn link && cd ./test/test-app && yarn link @cloudy-ts/esm-node"
);
project.testTask.prependExec("cd ./test/test-app && yarn");

project.synth();
