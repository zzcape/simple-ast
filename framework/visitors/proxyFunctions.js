const t = require('@babel/types');

module.exports = {
    VariableDeclarator(path) {
        const { id, init } = path.node;
        if (!t.isObjectExpression(init)) return;

        const objName = id.name;
        const functions = {};

        init.properties.forEach(prop => {
            if (!t.isObjectProperty(prop) || !t.isFunctionExpression(prop.value)) return;
            
            const funcName = prop.key.value || prop.key.name;
            const funcBody = prop.value.body.body;

            if (funcBody.length === 1 && t.isReturnStatement(funcBody[0])) {
                functions[funcName] = {
                    type: 'return',
                    node: funcBody[0].argument,
                    params: prop.value.params.map(p => p.name)
                };
            }
            else if (funcBody.length === 1 && t.isExpressionStatement(funcBody[0])) {
                 functions[funcName] = {
                    type: 'expression',
                    node: funcBody[0].expression,
                    params: prop.value.params.map(p => p.name)
                };
            }
        });

        if (Object.keys(functions).length === 0) return;

        const binding = path.scope.getBinding(objName);
        if (!binding) return;

        binding.referencePaths.forEach(refPath => {
            const memberExpr = refPath.parentPath;
            if (!memberExpr.isMemberExpression()) return;

            const propName = memberExpr.node.property.value || memberExpr.node.property.name;
            const funcInfo = functions[propName];
            
            if (!funcInfo) return;

            const callExpr = memberExpr.parentPath;
            if (!callExpr.isCallExpression()) return;

            const args = callExpr.node.arguments;

            if (funcInfo.type === 'return') {
                if (t.isBinaryExpression(funcInfo.node)) {
                    const { left, right, operator } = funcInfo.node;
                    
                    const replaceParam = (node) => {
                        if (t.isIdentifier(node)) {
                            const idx = funcInfo.params.indexOf(node.name);
                            if (idx !== -1) return args[idx];
                        }
                        return node;
                    };
                    // 必须 cloneNode 否则 AST 节点复用会导致问题
                    const newLeft = replaceParam(t.cloneNode(left));
                    const newRight = replaceParam(t.cloneNode(right));

                    callExpr.replaceWith(t.binaryExpression(operator, newLeft, newRight));
                }
            } 
            else if (funcInfo.type === 'expression') {
                 if (t.isCallExpression(funcInfo.node)) {
                     const newNode = t.cloneNode(funcInfo.node);
                     newNode.arguments = newNode.arguments.map(arg => {
                         if (t.isIdentifier(arg)) {
                             const idx = funcInfo.params.indexOf(arg.name);
                             if (idx !== -1) return args[idx];
                         }
                         return arg;
                     });
                     callExpr.replaceWith(newNode);
                 }
            }
        });
    }
};
