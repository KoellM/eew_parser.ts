# eew_parser.ts
TypeScript 紧急地震速报(緊急地震速報)电文解析器。

## 使用
```typescript
var test = new EEWParser(`37 03 00 170228165003 C11
170228164901
ND20170228164912 NCN913 JD////////////// JN///
289 N375 E1414 050 61 04 RK66554 RT10/// RC0////
EBI 251 S0404 ////// 01 250 S0404 ////// 01 221 S0404 ////// 01
220 S0404 ////// 01 222 S0404 ////// 01 242 S0404 ////// 01
300 S0403 ////// 01 252 S0403 ////// 01
9999=`)
// 输出
console.log(test.to_s()) 
```

## 参考
* 解析方法来自: [eew_parser](https://github.com/mmasaki/eew_parser)
* [高度利用者向け緊急地震速報コード電文フォーマット - 緊急地震速報メモ](http://eew.mizar.jp/excodeformat)