const PURE_ANNOTATION = "#__PURE__";

module.exports = function plugin() {
    return {
        name: "typescript-pure-enum",
        inherits: require("@babel/plugin-syntax-typescript").default,
        visitor: {
            CallExpression(path) {
                const callee = path.node.callee;
                const isIIFE = callee.type === "FunctionExpression";

                const firstParamName = callee.params[0].name;

                if (isIIFE) {
                    path.addComment("leading", PURE_ANNOTATION);
                }
            },
        },
    };
};
