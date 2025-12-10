const t = require('@babel/types');

module.exports = {
    // 将逗号表达式 (a, b, c) 转换为语句块 a; b; c;
    // 注意：仅当 SequenceExpression 作为 Statement 时才转换
    ExpressionStatement(path) {
        const { expression } = path.node;
        if (t.isSequenceExpression(expression)) {
            const expressions = expression.expressions;
            const statements = expressions.map(expr => t.expressionStatement(expr));
            path.replaceWithMultiple(statements);
        }
    },
    // 处理 return (a, b) -> a; return b;
    ReturnStatement(path) {
        const { argument } = path.node;
        if (t.isSequenceExpression(argument)) {
            const expressions = argument.expressions;
            const last = expressions.pop();
            
            const statements = expressions.map(expr => t.expressionStatement(expr));
            statements.push(t.returnStatement(last));
            
            path.replaceWithMultiple(statements);
        }
    }
};
