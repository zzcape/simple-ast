const t = require('@babel/types');

module.exports = {
    // 1. 成员表达式简化: obj['prop'] -> obj.prop
    MemberExpression(path) {
        const { property, computed } = path.node;
        if (computed && t.isStringLiteral(property)) {
            const value = property.value;
            // 检查是否为合法的标识符
            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
                path.node.property = t.identifier(value);
                path.node.computed = false;
            }
        }
    },

    // 2. 一元表达式简化
    UnaryExpression(path) {
        const { operator, argument } = path.node;
        
        // !![] -> true, ![] -> false, !0 -> true, !1 -> false
        // 这里可以使用 path.evaluate() 做通用处理
        const result = path.evaluate();
        if (result.confident) {
             // 仅替换为简单的 boolean, number, string
             if (typeof result.value === 'boolean') {
                 path.replaceWith(t.booleanLiteral(result.value));
             } else if (typeof result.value === 'number') {
                 path.replaceWith(t.numericLiteral(result.value));
             } else if (typeof result.value === 'string') {
                 path.replaceWith(t.stringLiteral(result.value));
             }
             // undefined, null 可以用 void 0, null 替换，视情况而定
             else if (result.value === undefined && operator === 'void') {
                 // void 0 经常被保留，不做处理或者统一
             }
        }
    }
};
