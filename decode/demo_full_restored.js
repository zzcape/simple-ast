// 全面混淆示例 demo_full.js

// 1. 字符串加密与大数组

// 2. 代理函数

function fullTask() {
  // 3. 逗号表达式混淆
  var x = (1, 2, 3);

  // 4. 控制流平坦化

  console.info("Start"); // console.info("Start")
  var result = 10 + 20;
  console.log(result);

  // 6. 死代码

  console.log("Always happens");

  // 7. Eval 混淆
  // 8. 奇怪的变量名 (将被重命名)
  console.log("Dynamic Code Executed");
  var v_4 = "Secret";
  console.log(v_4);
  console.log("Task done");
  return true;
}
fullTask();