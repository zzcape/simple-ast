const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const visitors = require('./visitors');

class Deobfuscator {
    constructor(code, options = {}) {
        this.code = code;
        this.ast = parser.parse(code, {
            sourceType: 'module'
        });
        // 默认启用的 visitors
        this.options = {
            literals: true,
            constants: true,
            stringArray: true,
            proxyFunctions: true,
            controlFlow: true,
            deadCode: true,
            simplify: true,
            evalRestore: true,
            sequenceExpr: true,
            renameVars: false, // 默认关闭重命名
            ...options
        };
    }

    run() {
        const ops = this.options;
        const v = visitors;

        // 1. Eval 还原 (最优先，因为它可能包含其他混淆代码)
        if (ops.evalRestore) traverse(this.ast, v.evalRestore);

        // 2. 基础字面量还原
        if (ops.literals) traverse(this.ast, v.literals);

        // 3. 逗号表达式还原
        if (ops.sequenceExpr) traverse(this.ast, v.sequenceExpr);

        // 4. 常量折叠
        if (ops.constants) traverse(this.ast, v.constants);

        // 5. 字符串数组解密
        if (ops.stringArray) {
            traverse(this.ast, { Program(p) { p.scope.crawl(); } });
            traverse(this.ast, v.stringArray);
        }

        // 6. 代理函数还原
        if (ops.proxyFunctions) traverse(this.ast, v.proxyFunctions);
        
        // 7. 控制流平坦化
        if (ops.controlFlow) traverse(this.ast, v.controlFlow);

        // 8. 死代码移除
        if (ops.deadCode) traverse(this.ast, v.deadCode);

        // 9. 语法简化
        if (ops.simplify) traverse(this.ast, v.simplify);

        // 10. 变量重命名 (最后执行)
        if (ops.renameVars) {
            traverse(this.ast, { Program(p) { p.scope.crawl(); } });
            traverse(this.ast, v.renameVars);
        }
        
        // 11. 清理未引用变量 (始终执行)
        traverse(this.ast, { Program(p) { p.scope.crawl(); } });
        traverse(this.ast, {
            VariableDeclarator(path) {
                const binding = path.scope.getBinding(path.node.id.name);
                if (binding && !binding.referenced && binding.constant) {
                     const init = path.node.init;
                     const t = require('@babel/types');
                     if (!init || t.isLiteral(init) || t.isObjectExpression(init) || t.isArrayExpression(init) || t.isFunctionExpression(init)) {
                         path.remove();
                     }
                }
            }
        });

        return this;
    }

    generate(options = { minimal: true }) {
        return generator(this.ast, {
            jsescOption: options
        }).code;
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: node index.js <input_file> [output_file]");
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.js', '_restored.js');

    try {
        const code = fs.readFileSync(inputFile, 'utf-8');
        const deobfuscator = new Deobfuscator(code, { renameVars: true }); // CLI 模式下默认开启重命名测试
        const result = deobfuscator.run().generate();
        
        console.log(`Deobfuscation complete.`);
        console.log(`Input: ${inputFile}`);
        console.log(`Output: ${outputFile}`);
        
        fs.writeFileSync(outputFile, result);
    } catch (error) {
        console.error("Error during deobfuscation:", error);
    }
}

module.exports = Deobfuscator;
