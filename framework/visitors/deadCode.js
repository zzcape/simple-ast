const t = require('@babel/types');

module.exports = {
    IfStatement(path) {
        const { test, consequent, alternate } = path.node;
        
        let evaluated = null;
        try {
            const result = path.get('test').evaluate();
            if (result.confident) {
                evaluated = result.value;
            }
        } catch (e) {}

        if (evaluated === true) {
            if (consequent.type === 'BlockStatement') {
                path.replaceWithMultiple(consequent.body);
            } else {
                path.replaceWith(consequent);
            }
        } else if (evaluated === false) {
            if (alternate) {
                if (alternate.type === 'BlockStatement') {
                    path.replaceWithMultiple(alternate.body);
                } else {
                    path.replaceWith(alternate);
                }
            } else {
                path.remove();
            }
        }
    },
    // 清理空的 BlockStatement (可选，有时候会残留 { })
    BlockStatement(path) {
         if (path.node.body.length === 0 && t.isBlockStatement(path.parent)) {
             // 仅删除嵌套的空块，不要删除函数体等
             // path.remove(); // 暂时保守一点，不乱删
         }
    }
};
