const Deobfuscator = require('./framework/index');
const fs = require('fs');

const inputFile = 'demo_full.js';
const outputFile = './decode/demo_full_restored.js';

console.log(`Processing ${inputFile}...`);

const code = fs.readFileSync(inputFile, 'utf-8');

// 使用自定义配置
const deobfuscator = new Deobfuscator(code, {
    literals: true, // 字符串或number类型取value
    constants: true,  // 简单的计算表达式 字符串拼接或数值计算类型
    stringArray: true,
    proxyFunctions: true,
    controlFlow: true,
    deadCode: true,
    simplify: true,  //成员取值，取真or取反
    evalRestore: true,
    sequenceExpr: true,
    renameVars: true // 开启变量重命名
});

const result = deobfuscator.run().generate();

fs.writeFileSync(outputFile, result);
console.log(`Saved to ${outputFile}`);
console.log('--- Preview ---');
console.log(result.slice(0, 500) + '...');
