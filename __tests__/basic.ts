import { transformSync } from "@babel/core";
import pureEnumsPlugin from "../src/plugin";

test("should add pure annotation for enums", () => {
  const code = `
        enum Hello {
            World
        }
    `;

  const result = transformSync(code, {
    filename: "file.ts",
    plugins: [pureEnumsPlugin],
    presets: ["@babel/typescript"],
  });

  expect(result.code).toContain("/*#__PURE__*/");
});
