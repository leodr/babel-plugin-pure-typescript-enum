import { NodePath, types } from "@babel/core";

export default function plugin() {
  return {
    name: "typescript-pure-enum",
    inherits: require("@babel/plugin-syntax-typescript").default,
    visitor: {
      CallExpression(path: NodePath<types.CallExpression>) {
        const callee = path.node.callee;
        const isIIFE = callee.type === "FunctionExpression";

        if (isIIFE) {
          const enumName = ((callee as types.FunctionExpression)
            .params[0] as types.Identifier).name;

          const expressionArguments = path.node.arguments;

          if (expressionArguments.length === 1) {
            const [firstArgument] = expressionArguments;

            if (
              firstArgument.type === "LogicalExpression" &&
              (firstArgument.left as types.Identifier).name === enumName
            ) {
              path.addComment("leading", "#__PURE__");
            }
          }
        }
      },
    },
  };
}
