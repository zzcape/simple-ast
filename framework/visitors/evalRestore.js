const t = require('@babel/types');
const parser = require('@babel/parser');

module.exports = {
    CallExpression(path) {
        const { callee, arguments: args } = path.node;
        
        // 匹配 eval("code")
        if (t.isIdentifier(callee, { name: 'eval' }) && args.length === 1 && t.isStringLiteral(args[0])) {
            const codeString = args[0].value;
            try {
                // 解析 eval 中的代码
                // 注意：这里假设 eval 中的代码是 statements，如果是 expression 需要处理
                const ast = parser.parse(codeString, { sourceType: 'module' });
                const statements = ast.program.body;
                
                path.replaceWithMultiple(statements);
            } catch (e) {
                // 解析失败则忽略
            }
        }
    }
};
