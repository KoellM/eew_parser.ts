# eew_parser.ts
TypeScript 紧急地震速报(緊急地震速報)电文解析器。

## 使用
```typescript
var test = new EEWParser(`39 03 10 160801170919 C11
160801170902
ND20160801170904 NCN003 JD////////////// JN///
/// //// ///// /// // // RK///// RT///// RC/////
9999=`)
// 输出
console.log(test.to_s()) 
```

## 参考
* [eew_parser](https://github.com/mmasaki/eew_parser)
* [高度利用者向け緊急地震速報コード電文フォーマット - 緊急地震速報メモ](http://eew.mizar.jp/excodeformat)