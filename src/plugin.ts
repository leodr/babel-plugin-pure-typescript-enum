import { NodePath, types } from "@babel/core";

export default function plugin() {
  return {
    name: "typescript-pure-enum",
    inherits: require("@babel/plugin-syntax-typescript").default,
    visitor: {
      CallExpression(path: NodePath<types.CallExpression>) {
        const callee = path.node.callee;

        if (isFunctionExpression(callee)) {
          const params = callee.params;
          const [firstParam] = params;

          if (isIdentifier(firstParam)) {
            const enumName = firstParam.name;

            const expressionArguments = path.node.arguments;

            if (expressionArguments.length === 1) {
              const [firstArgument] = expressionArguments;

              if (isLogicalExpression(firstArgument)) {
                const { left } = firstArgument;

                if (isIdentifier(left) && left.name === enumName) {
                  path.addComment("leading", "#__PURE__");
                }
              }
            }
          }
        }
      },
    },
  };
}

function isFunctionExpression(
  node: types.Node
): node is types.FunctionExpression {
  return node.type === "FunctionExpression";
}

function isIdentifier(node: types.Node | undefined): node is types.Identifier {
  return node?.type === "Identifier";
}

function isLogicalExpression(
  node: types.Node | undefined
): node is types.LogicalExpression {
  return node?.type === "LogicalExpression";
}
