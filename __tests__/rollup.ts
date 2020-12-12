import { transformSync } from "@babel/core";
import virtual from "@rollup/plugin-virtual";
import * as acorn from "acorn";
import { rollup } from "rollup";
import pureEnumsPlugin from "../src/plugin";

test("should shake away an unused enum", async () => {
  const code = `
        export enum Hello {
            World,
        }
    `;

  const result = transformSync(code, {
    filename: "file.ts",
    plugins: [pureEnumsPlugin],
    presets: ["@babel/typescript"],
  });

  const bundle = await rollup({
    input: "test",
    plugins: [
      virtual({
        test: `import "code"`,
        code: result.code,
      }),
    ],
    onwarn: (warning, handle) => {
      if (warning.code !== "EMPTY_BUNDLE") handle(warning);
    },
  });

  const resultBundle = await bundle.generate({
    format: "esm",
  });

  const { code: bundleCode } = resultBundle.output[0];

  const ast = acorn.parse(bundleCode, {
    ecmaVersion: 11,
    sourceType: "module",
  });

  const nodes = ast.body.filter((node) => {
    return node.type !== "ImportDeclaration";
  });

  expect(nodes.length === 0).toBe(false);
});

test("should leave the enum intact if used", async () => {
  const code = `
        enum Hello {
            World,
        }
        export default Hello
    `;

  const result = transformSync(code, {
    filename: "file.ts",
    plugins: [pureEnumsPlugin],
    presets: ["@babel/typescript", ["@babel/env", { modules: false }]],
  });

  const bundle = await rollup({
    input: "test",
    plugins: [
      virtual({
        test: `export { default as MyEnum } from "code"`,
        code: result.code,
      }),
    ],
    onwarn: (warning, handle) => {
      if (warning.code !== "EMPTY_BUNDLE") handle(warning);
    },
  });

  const resultBundle = await bundle.generate({ format: "esm" });

  const { code: bundleCode } = resultBundle.output[0];

  const ast = acorn.parse(bundleCode, {
    ecmaVersion: 11,
    sourceType: "module",
  });

  const hasExpression = ast.body.some(
    (node) => node.type === "ExpressionStatement"
  );

  expect(hasExpression).toBe(true);
});
