const t = require('@babel/types');

module.exports = {
    IfStatement(path) {
        const consequent = path.get('consequent');
        if (!consequent.isBlockStatement()) {
            path.node.consequent = t.blockStatement([consequent.node]);
        }
        
        if (path.node.alternate) {
            const alternate = path.get('alternate');
            // 不要包装 "else if"
            if (!alternate.isBlockStatement() && !alternate.isIfStatement()) {
                path.node.alternate = t.blockStatement([alternate.node]);
            }
        }
    },
    'ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement'(path) {
        const body = path.get('body');
        if (!body.isBlockStatement()) {
            path.node.body = t.blockStatement([body.node]);
        }
    },
    ArrowFunctionExpression(path) {
        // 箭头函数体可能是表达式
        if (!t.isBlockStatement(path.node.body)) {
             path.node.body = t.blockStatement([t.returnStatement(path.node.body)]);
        }
    }
};
