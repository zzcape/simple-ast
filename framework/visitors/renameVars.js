const t = require('@babel/types');

module.exports = {
    // 简单的重命名策略：将 _0x... 这种看起来像混淆的变量名重命名为 v_1, v_2...
    // 注意：这只是一个简单的示例，实际重命名需要考虑作用域冲突等复杂情况
    Program(path) {
        path.scope.crawl();
        let counter = 0;
        const renameMap = new Map();

        path.traverse({
            Identifier(idPath) {
                const name = idPath.node.name;
                // 匹配 _0x 开头 或者 只有 1-2 个字符且包含奇怪字符的
                if (/^(_0x|_[a-z0-9]{2,})/.test(name)) {
                     const binding = idPath.scope.getBinding(name);
                     if (binding) {
                         let newName = renameMap.get(name);
                         if (!newName) {
                             newName = `v_${++counter}`;
                             renameMap.set(name, newName);
                             // 使用 scope.rename 会自动处理所有引用
                             idPath.scope.rename(name, newName);
                         }
                     }
                }
            }
        });
    }
};
