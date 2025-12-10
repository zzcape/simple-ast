const t = require('@babel/types');

module.exports = {
    VariableDeclarator(path) {
        const { id, init } = path.node;
        if (!t.isArrayExpression(init)) return;

        const elements = init.elements;
        // 简单判断：全为字面量才处理
        if (!elements.every(el => t.isStringLiteral(el) || t.isNumericLiteral(el))) return;

        const binding = path.scope.getBinding(id.name);
        if (!binding) return;

        if (!binding.constant) return; 

        for (const refPath of binding.referencePaths) {
            const memberExpr = refPath.parentPath;
            if (!memberExpr.isMemberExpression()) continue;

            const property = memberExpr.node.property;
            let index;

            if (memberExpr.node.computed && t.isNumericLiteral(property)) {
                index = property.value;
            } else {
                continue;
            }

            if (index >= 0 && index < elements.length) {
                memberExpr.replaceWith(elements[index]);
            }
        }
    }
};
