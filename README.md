使用ai生成的简易通用ast解混淆方法，后续按需求进行visitor的增改
# 使用示例
```javascript
const Deobfuscator = require('./framework/index');

const code = fs.readFileSync('input.js', 'utf-8');

// 方式 1: 使用默认配置 (自动构建 pipeline)
const deob1 = new Deobfuscator(code, {
    simplify: true,
    deadCode: true
});

// 方式 2: 自定义 Pipeline (支持多次执行)
// 这种方式会忽略布尔开关，完全按照数组顺序执行
const deob2 = new Deobfuscator(code, {
    pipeline: [
        'blockStatement',      // 1. 规范化代码块
        'literals',            // 2. 还原字面量
        'simplify',            // 3. 初步简化
        'controlFlow',         // 4. 控制流平坦化
        'deadCode',            // 5. 移除死代码
        'simplify',            // 6. 再次简化 (处理平坦化后暴露出的逻辑)
        'removeEmptyStatement' // 7. 清理
    ]
});

const result = deob2.run().generate();
```