// 全面混淆示例 demo_full.js

// 1. 字符串加密与大数组
var _0xabc123 = ["\x6c\x6f\x67", "\x68\x65\x6c\x6c\x6f", "\x77\x6f\x72\x6c\x64", "\x69\x6e\x66\x6f"];

// 2. 代理函数
var _utils = {
    'add': function(a, b) { return a + b; },
    'sub': function(a, b) { return a - b; },
    'print': function(str) { console[_0xabc123[0]](str); }
};

function fullTask() {
    // 3. 逗号表达式混淆
    var x = (1, 2, 3);
    
    // 4. 控制流平坦化
    var _dispatch = "3|1|4|0|2".split("|");
    var _idx = 0;
    while (!![]) { // 5. Unary Expression: !![] -> true
        switch (_dispatch[_idx++]) {
            case "0":
                var result = _utils['add'](10, 20);
                continue;
            case "1":
                var a = 1;
                continue;
            case "2":
                _utils['print'](result);
                continue;
            case "3":
                console[_0xabc123[3]]("Start"); // console.info("Start")
                continue;
            case "4":
                var b = 2;
                continue;
        }
        break;
    }

    // 6. 死代码
    if ("a" === "b") {
        console.log("Never happens");
    } else {
        console.log("Always happens");
    }
    
    // 7. Eval 混淆
    eval("console.log('Dynamic Code Executed'); var dynamicVar = 100;");
    
    // 8. 奇怪的变量名 (将被重命名)
    var _0x999 = "Secret";
    console.log(_0x999);
    
    return (console.log('Task done'), true);
}

fullTask();
