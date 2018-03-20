# eew_parser.ts
TypeScript 紧急地震速报(緊急地震速報/EEW PLUM法)电文解析器。

## 使用
```typescript
const test = new EEWParser(`36 03 00 020117093016 C11
020117093010
ND20020117093012 NCN002 JD20020117093012 JN001
486 N343 E1384 010 55 5- RK224// RT01000 RC00000
EBI 440 S6-// 093022 10 442 S6-// 093022 10 443 S6-// 093030 10 441
S6-// 093036 10
9999=`)
```

## 参考
* 解析方法来自: [PLUM 法を導入した緊急地震速報の配信について](http://www.data.jma.go.jp/add/suishin/jyouhou/pdf/476.pdf)
* [平成 29 年４月版「地震・津波・火山に関する情報のコード電文解説資料」について](http://www.data.jma.go.jp/add/suishin/jyouhou/pdf/462.pdf)


## 附录

```
緊急地震速報（予報）
「aa bb nn yiyimimididihihimimisisi Cnf yoyomomododohohomomososo NDnnnnnnnnnnnnnn
NCNann JDnnnnnnnnnnnnnn JNnnn kkk nddd edddd hhh mm ss RKn1n2n3n4n5
RTn1n2n3n4n5 RCn1n2n3n4n5 {EBI [{fff Se1e2e3e4 hhmmss y1y2}…]}
{ECI [{fffff Se1e2e3e4 hhmmss y1y2}…]} {EII [{fffffff Se1e2e3e4 hhmmss y1y2}…]}
9999=」
```
```
緊急地震速報（警報）
「aa bb nn yiyimimididihihimimisisi Cnf
yoyomomododohohomomososo
NDnnnnnnnnnnnnnn NCPNnn
cccc nddd edddd hhh
PRCn1n2n3n4n5
CAI {[aaaa]･･･}
CPI {[pppp]･･･}
CBI {[bbb]･･･}
PAI {[aaaa]･･･}
PPI {[pppp]･･･}
PBI {[bbb]･･･}
NCP
NDnnnnnnnnnnnnnn NCNann JDnnnnnnnnnnnnnn JNnnn
kkk nddd edddd hhh mm ss RKn1n2n3n4n5 RTn1n2n3n4n5 RCn1n2n3n4n5
EBI [{fff Se1e2e3e4 hhmmss y1y2}…]
9999=」
```