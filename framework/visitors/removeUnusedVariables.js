const t = require('@babel/types');

module.exports = {
    Program(p) { p.scope.crawl(); },
    VariableDeclarator(path) {
        const binding = path.scope.getBinding(path.node.id.name);
        // 确保 binding 存在，且未被引用，且是常量（未被重新赋值）
        // 注意：有些混淆器可能会修改变量，所以 constant 检查可能需要根据情况放宽，
        // 但为了安全起见，默认检查 constant
        if (binding && !binding.referenced && binding.constant) {
             const init = path.node.init;
             // 仅移除初始化为字面量、对象、数组、函数的变量，避免移除有副作用的表达式
             if (!init || t.isLiteral(init) || t.isObjectExpression(init) || t.isArrayExpression(init) || t.isFunctionExpression(init) || t.isArrowFunctionExpression(init)) {
                 path.remove();
             }
        }
    }
};
