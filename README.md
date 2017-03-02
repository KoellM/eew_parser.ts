## eew_parser.js
JavaScript 紧急地震速报(緊急地震速報)电文解析器。

## 使用
'''javscript
var test = new EEWParser(`39 03 10 160801170919 C11
160801170902
ND20160801170904 NCN003 JD////////////// JN///
/// //// ///// /// // // RK///// RT///// RC/////
9999=`)
// 输出
console.log(test.to_s()) 
'''