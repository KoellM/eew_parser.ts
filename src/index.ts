import AreaCode from './definitions/AreaCode';
import EpicenterCode from './definitions/EpicenterCode';
import TelegramType from './definitions/TelegramType';
import DrillType from './definitions/DrillType';

/** 
 * eew_parser.ts
 * 高度利用者向紧急地震速报解析器 
 * 解析方法来自 eew_parser(https://github.com/mmasaki/eew_parser)
*/
export default class EEWParser {
    private telegram: string
    /**
     * @param telegram
    */
    constructor(telegram: string) {
        this.telegram = telegram;
    }

    private fastsub(start: number, num: number = 0): string {
        let numend: number = start + num;
        return this.telegram.substring(start, numend)
    }

    /** 返回电文 */
    getTelegram(): string {
        return this.telegram;
    }

    /** 返回紧急地震速报内容 */
    toString(): string {
        if (this.type == "キャンセル報") {
            return `
電文種別: ${this.type}
発信官署: ${this.from}
訓練等の識別符: ${this.drillType}
電文の発表時刻: ${this.reportTime}
電文がこの電文を含め何通あるか: ${this.numberOfTelegram}
コードが続くかどうか: ${this.isContinue}
地震発生時刻: ${this.earthquakeTime}
地震識別番号: ${this.id}
発表状況の指示: ${this.status}
発表する高度利用者向け緊急地震速報の番号: ${this.number}`
        } else {
            let str = `電文種別: ${this.type}
発信官署: ${this.from}
訓練等の識別符: ${this.drillType}
電文の発表時刻: ${this.reportTime}
電文がこの電文を含め何通あるか: ${this.numberOfTelegram}
コードが続くかどうか: ${this.isContinue}
地震発生時刻: ${this.earthquakeTime}
地震識別番号: ${this.id}
発表状況の指示: ${this.status}
発表する高度利用者向け緊急地震速報の番号: ${this.number}
震央地名: ${this.epicenter}
震央の位置: ${this.position}
震源の深さ(km): ${this.depth}
マグニチュード: ${this.magnitude}
最大予測震度: ${this.seismicIntensity}
震央の確からしさ: ${this.probabilityOfPosition}
震源の深さの確からしさ: ${this.probabilityOfDepth}
マグニチュードの確からしさ: ${this.probabilityOfMagnitude}
震央の確からしさ(気象庁の部内システムでの利用): ${this.probabilityOfPositionJMA}
震源の深さの確からしさ(気象庁の部内システムでの利用): ${this.probabilityOfDepthJMA}
震央位置の海陸判定: ${this.landOrSea}
警報を含む内容かどうか: ${this.isWarning}
最大予測震度の変化: ${this.isChanged}
最大予測震度の変化の理由: ${this.reasonOfChange}
`
            if (this.ebi.length) {
                str += `
最大予測震度と主要動到達予測時刻
`
                for (let ebi of this.ebi) {
                    str += `
地域コード: ${ebi.area_code}
地域名称: ${ebi.area_name}
予測震度: ${ebi.intensity}
予想到達時刻: ${ebi.arrival_time}
警報を含むかどうか: ${ebi.warning}
既に到達しているかどうか: ${ebi.arrival}
            `
                }
            }
            return str
        }
    }

    /** 电文类型 */
    get type(): string {
        const telegramCode = this.fastsub(0, 2);
        const telegramType = TelegramType[telegramCode];
        if (telegramType === undefined) {
            throw new Error("電文の形式が不正です(電文種別コード)")
        } else {
            return telegramType;
        }
    }

    /** 発信官署 */
    get from(): string {
        switch (this.fastsub(3, 2)) {
            case "01":
                return "札幌"
            case "02":
                return "仙台"
            case "03":
                return "東京"
            case "04":
                return "大阪"
            case "05":
                return "福岡"
            case "06":
                return "沖縄" // 不确定冲绳是否还在继续发信。
            case "11":
                return "札幌"
            case "12":
                return "仙台"
            case "13":
                return "東京"
            case "14":
                return "大阪"
            case "15":
                return "福岡"
            case "16":
                return "沖縄" // 不确定冲绳是否还在继续发信。
            default:
                throw new Error("電文の形式が不正です(発信官署)")
        }
    }

    /** 訓練等の識別符 */
    get drillType(): string {
        const drillTypeCode = this.fastsub(6, 2);
        const drillType = DrillType[drillTypeCode];
        if (drillType === undefined) {
            throw new Error("電文の形式が不正です(識別符)")
        } else {
            return drillType;
        }
    }

    /** 電文の発表時刻 */
    get reportTime(): Date {
        let time = `20${this.fastsub(9, 2)}-${this.fastsub(11, 2)}-${this.fastsub(13, 2)}T${this.fastsub(15, 2)}:${this.fastsub(17, 2)}:${this.fastsub(19, 2)}+09:00`
        let report_time = new Date(time)
        return report_time
    }

    /** 電文がこの電文を含め何通あるか */
    get numberOfTelegram(): string {
        let number_of_telegram = this.fastsub(23, 1)
        return number_of_telegram;
    }

    /** コードが続くかどうか */
    get isContinue(): boolean {
        switch (this.fastsub(24, 1)) {
            case "1":
                return true
            case "0":
                return false
            default:
                throw new Error("電文の形式が不正です")
        }
    }

    /** 地震発生時刻もしくは地震検知時刻 */
    get earthquakeTime(): Date {
        let time = `20${this.fastsub(26, 2)}-${this.fastsub(28, 2)}-${this.fastsub(30, 2)}T${this.fastsub(32, 2)}:${this.fastsub(34, 2)}:${this.fastsub(36, 2)}+09:00`
        let earthquake_time = new Date(time)
        return earthquake_time
    }

    /** 地震識別番号 */
    get id(): string {
        let id = this.fastsub(41, 14)
        if (!new RegExp(/[^\d]/).test(id)) {
            return id
        } else {
            throw new Error("電文の形式が不正です(地震識別番号)")
        }
    }

    /** 発表状況の指示 */
    get status(): string {
        switch (this.fastsub(59, 1)) {
            case "0":
                return "通常発表"
            case "6":
                return "情報内容の訂正"
            case "7":
                return "キャンセルを誤って発表した場合の訂正"
            case "8":
                return "訂正事項を盛り込んだ最終の高度利用者向け緊急地震速報"
            case "9":
                return "最終の高度利用者向け緊急地震速報"
            case "/":
                return "未設定"
            default:
                throw new Error("電文の形式が不正です")
        }
    }

    /** 最終報 */
    get final(): boolean {
        switch (this.fastsub(59, 1)) {
            case "9":
                return true
            case "0": case "6": case "7": case "8": case "/":
                return false
            default:
                throw new Error("電文の形式が不正です")
        }
    }

    /** 発表する高度利用者向け緊急地震速報の番号 */
    get number(): number {
        let number = this.fastsub(60, 2)
        if (!new RegExp(/[^\d]/).test(number)) {
            return parseInt(number)
        } else {
            throw new Error("電文の形式が不正です(高度利用者向け緊急地震速報の番号)")
        }
    }

    /** 震央の名称 */
    get epicenter(): string {
        let key = this.fastsub(86, 3)
        if (!new RegExp(/[^\d]/).test(key)) {
            return EpicenterCode[key]
        } else if (key == "///") {
            return null
        } else {
            throw new Error("電文の形式が不正です(震央の名称)")
        }
    }

    get position(): string {
        let position = this.fastsub(90, 10)
        if (position == "//// /////") {
            return "不明"
        } else {
            if (!new RegExp(/[^\d|\s|N|E]/).test(position)) {
                return `${position[0]}${position[1]}${position[2]}.${position[3]}${position[4]}${position[5]}${position[6]}${position[7]}${position[8]}.${position[9]}`
            } else {
                throw new Error("電文の形式が不正です(震央の位置)")
            }
        }
    }

    get depth() {
        let depth = this.fastsub(101, 3)
        if (depth == "///") {
            return "不明"
        } else {
            if (!new RegExp(/[^\d]/).test(depth)) {
                return parseInt(depth)
            } else {
                throw new Error("電文の形式が不正です(震源の深さ)")
            }
        }
    }

    get magnitude() {
        let magnitude = this.fastsub(105, 2)
        if (magnitude == "//") {
            return "不明"
        } else {
            if (!new RegExp(/[^\d]/).test(magnitude)) {
                return parseFloat(`${magnitude[0]}.${magnitude[1]}`)
            } else {
                throw new Error("電文の形式が不正です(マグニチュード)")
            }
        }
    }

    toSeismicIntensity(str): string {
        switch (str) {
            case "//":
                return "不明"
            case "01":
                return "1"
            case "02":
                return "2"
            case "03":
                return "3"
            case "04":
                return "4"
            case "5-":
                return "5弱"
            case "5+":
                return "5強"
            case "6-":
                return "6弱"
            case "6+":
                return "6強"
            case "07":
                return "7"
            default:
                throw new Error("電文の形式が不正です(震度)")
        }
    }

    /**
     * 最大预测震度
     * 震源深度超过 150km 时，将会返回不明。
     */
    get seismicIntensity(): string {
        try {
            return this.toSeismicIntensity(this.fastsub(108, 2))
        } catch (e) {
            throw new Error("電文の形式が不正です(最大予測震度)")
        }
    }

    get probabilityOfPosition(): string {
        switch (this.fastsub(113, 1)) {
            case "1":
                return "P波/S波レベル越え、またはテリトリー法(1点)[気象庁データ]"
            case "2":
                return "テリトリー法(2点)[気象庁データ]"
            case "3":
                return "グリッドサーチ法(3点/4点)[気象庁データ]"
            case "4":
                return "グリッドサーチ法(5点)[気象庁データ]"
            case "5":
                return "防災科研システム(4点以下、または精度情報なし)[防災科学技術研究所データ]"
            case "6":
                return "防災科研システム(5点以上)[防災科学技術研究所データ]"
            case "7":
                return "EPOS(海域[観測網外])[気象庁データ]"
            case "8":
                return "EPOS(内陸[観測網内])[気象庁データ]"
            case "9":
                return "予備"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震央の確からしさ)")
        }
    }

    get probabilityOfDepth(): string {
        switch (this.fastsub(114, 1)) {
            case "1":
                return "P波/S波レベル越え、またはテリトリー法(1点)[気象庁データ]"
            case "2":
                return "テリトリー法(2点)[気象庁データ]"
            case "3":
                return "グリッドサーチ法(3点/4点)[気象庁データ]"
            case "4":
                return "グリッドサーチ法(5点)[気象庁データ]"
            case "5":
                return "防災科研システム(4点以下、または精度情報なし)[防災科学技術研究所データ]"
            case "6":
                return "防災科研システム(5点以上)[防災科学技術研究所データ]"
            case "7":
                return "EPOS(海域[観測網外])[気象庁データ]"
            case "8":
                return "EPOS(内陸[観測網内])[気象庁データ]"
            case "9":
                return "予備"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震源の深さの確からしさ))")
        }
    }

    get probabilityOfMagnitude(): string {
        switch (this.fastsub(115, 1)) {
            case "1":
                return "未設定"
            case "2":
                return "防災科研システム[防災科学技術研究所データ]"
            case "3":
                return "全点(最大5点)P相[気象庁データ]"
            case "4":
                return "P相/全相混在[気象庁データ]"
            case "5":
                return "全点(最大5点)全相[気象庁データ]"
            case "6":
                return "EPOS[気象庁データ]"
            case "7":
                return "未定義"
            case "8":
                return "P波/S波レベル越え[気象庁データ]"
            case "9":
                return "予備"
            case "/": case "0":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(マグニチュードの確からしさ)")
        }
    }
    
    get probabilityOfPositionJMA(): string {
        switch (this.fastsub(116, 1)) {
            case "1":
                return "P波/S波レベル越え又はテリトリー法(1点)[気象庁データ]"
            case "2":
                return "テリトリー法(2点)[気象庁データ]"
            case "3":
                return "グリッドサーチ法(3点)[気象庁データ]"
            case "4":
                return "グリッドサーチ法(4点)[気象庁データ]"
            case "5":
                return "グリッドサーチ法(3点)[気象庁データ]"
            case "6": case "7": case "8": case "9": case "0":
                return "未使用"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震央の確からしさ[気象庁の部内システムでの利用])")
        }
    }
    get probabilityOfDepthJMA(): string {
        switch (this.fastsub(117, 1)) {
            case "1":
                return "P波/S波レベル越え又はテリトリー法(1点)[気象庁データ]"
            case "2":
                return "テリトリー法(2点)[気象庁データ]"
            case "3":
                return "グリッドサーチ法(3点/4点)[気象庁データ]"
            case "4":
                return "グリッドサーチ法(5点以上)[気象庁データ]"
            case "5": case "6": case "7": case "8": case "9": case "0":
                return "未使用"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震源の深さの確からしさ[気象庁の部内システムでの利用])")
        }
    }

    get landOrSea(): string {
        switch (this.fastsub(121, 1)) {
            case "0":
                return "陸域"
            case "1":
                return "海域"
            case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震央位置の海陸判定)")
        }
    }

    get isWarning(): boolean {
        switch (this.fastsub(122, 1)) {
            case "0": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case "/":
                return false
            case "1":
                return true
            default:
                throw new Error("電文の形式が不正です(警報の判別)")
        }
    }

    get isChanged(): string {
        switch (this.fastsub(129, 1)) {
            case "0":
                return "ほとんど変化無し"
            case "1":
                return "最大予測震度が1.0以上大きくなった"
            case "2":
                return "最大予測震度が1.0以上小さくなった"
            case "3": case "4": case "5": case "6": case "7": case "8": case "9":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(最大予測震度の変化)")
        }
    }

    get reasonOfChange(): string {
        switch (this.fastsub(130, 1)) {
            case "0":
                return "変化無し"
            case "1":
                return "主としてMが変化したため(1.0以上)"
            case "2":
                return "主として震源位置が変化したため(10.0km以上)"
            case "3":
                return "M及び震源位置が変化したため"
            case "4":
                return "震源の深さが変化したため"
            case "5": case "6": case "7": case "8": case "9":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(最大予測震度の変化の理由)")
        }
    }

    get ebi() {
        let data = []
        if (this.fastsub(135, 3) != "EBI") {
            return data
        }
        let i = 139
        while (i + 20 < this.getTelegram().length) {
            let local = {}
            local["area_code"] = this.fastsub(i, 3) // 地区代码
            local["area_name"] = AreaCode[local["area_code"]] // 地区名称
            if (!local["area_name"]) {
                throw new Error("電文の形式が不正でです(地域名称[EBI])")
            }
            /** 震度 */
            if (this.fastsub(i + 7, 2) == "//") {
                local["intensity"] = `${this.toSeismicIntensity(this.fastsub(i + 5, 2))}以上`
            } else if (this.fastsub(i + 5, 2) == this.fastsub(i + 7, 2)) {
                local["intensity"] = this.toSeismicIntensity(this.fastsub(i + 5, 2))
            } else {
                local["intensity"] = `${this.toSeismicIntensity(this.fastsub(i + 7, 2))}～${this.toSeismicIntensity(this.fastsub(i + 5, 2))}`
            }
            /** 预想到达时间 */
            if (this.fastsub(i + 10, 6) == "//////") {
                local["arrival_time"] = null
            } else {
                local['arrival_time'] = new Date(`20${this.fastsub(26, 2)}-${this.fastsub(28, 2)}-${this.fastsub(30, 2)}T${this.fastsub(i + 10, 2)}:${this.fastsub(i + 12, 2)}:${this.fastsub(i + 14, 2)}+09:00`)
            }
            /** 是否为警报地区 */
            switch (this.fastsub(i + 17, 1)) {
                case "0":
                    local["warning"] = false
                    break;
                case "1":
                    local["warning"] = true
                    break;
                case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case "/":
                    local["warning"] = null
                    break;
                default:
                    throw new Error("電文の形式が不正でです(警報の判別[EBI])")
            }

            /** 是否到达 */
            switch (this.fastsub(i + 18, 1)) {
                case "0":
                    local["arrival"] = false
                    break;
                case "1":
                    local["arrival"] = true
                    break;
                case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case "/":
                    local["arrival"] = null
                    break;
                default:
                    throw new Error("電文の形式が不正でです(主要動の到達予測状況[EBI])")
            }
            data.push(local)
            i += 20
        }
        return data
    }
}