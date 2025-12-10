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
        // 默认配置
        this.options = {
            // 如果提供了 pipeline 数组，将优先使用该数组定义执行顺序和次数
            // 例如: ['simplify', 'deadCode', 'simplify']
            pipeline: null,

            // 下方是默认 pipeline 的构建开关 (仅当 pipeline 为 null 时生效)
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

    /**
     * 执行指定的 visitors
     * @param {Array<string|Object>} visitorList visitor 名称或对象数组
     */
    transform(visitorList) {
        visitorList.forEach(v => {
            if (typeof v === 'string') {
                if (visitors[v]) {
                    traverse(this.ast, visitors[v]);
                } else {
                    console.warn(`未找到 Visitor: '${v}'`);
                }
            } else if (typeof v === 'object') {
                traverse(this.ast, v);
            }
        });
        return this;
    }

    /**
     * 运行解混淆流程
     * 如果 options 中指定了 pipeline，则按 pipeline 执行
     * 否则根据 boolean 选项构建默认 pipeline
     */
    run() {
        // 1. 如果指定了 pipeline，直接执行
        if (this.options.pipeline && Array.isArray(this.options.pipeline)) {
            return this.transform(this.options.pipeline);
        }

        // 2. 否则构建默认 pipeline
        const ops = this.options;
        const pipeline = [];

        // 1. Eval 还原 (最优先，因为它可能包含其他混淆代码)
        if (ops.evalRestore) pipeline.push('evalRestore');

        // 2. 基础字面量还原
        if (ops.literals) pipeline.push('literals');

        // 3. 逗号表达式还原
        if (ops.sequenceExpr) pipeline.push('sequenceExpr');

        // 4. 常量折叠
        if (ops.constants) pipeline.push('constants');

        // 5. 字符串数组解密
        if (ops.stringArray) pipeline.push('stringArray');

        // 6. 代理函数还原
        if (ops.proxyFunctions) pipeline.push('proxyFunctions');
        
        // 7. 控制流平坦化
        if (ops.controlFlow) pipeline.push('controlFlow');

        // 8. 死代码移除
        if (ops.deadCode) pipeline.push('deadCode');

        // 9. 语法简化
        if (ops.simplify) pipeline.push('simplify');

        // 10. 变量重命名 (最后执行)
        if (ops.renameVars) pipeline.push('renameVars');
        
        // 11. 清理未引用变量 (始终执行)
        pipeline.push('removeUnusedVariables');

        return this.transform(pipeline);
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
