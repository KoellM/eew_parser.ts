import * as Definitions from './definitions';

export class TelegramFormatInvalidError extends Error {
    constructor(message: string = Definitions.Errors.UNKNOWN_ERROR) {
        super(message);
        this.name = "telegram_format_invalid";
    }
}

/** 
 * eew_parser.ts
 * 高度利用者向紧急地震速报解析器 
 * 解析方法来自 eew_parser(https://github.com/mmasaki/eew_parser)
*/
export default class EEWParser {
    private telegram: string;
    private language: string;
    /**
     * @param telegram
    */
    constructor(telegram: string, language: string = 'ja') {
        this.telegram = telegram;
        this.language = language;
    }

    private fastsub(start: number, num: number = 0): string {
        const numend: number = start + num;
        return this.telegram.substring(start, numend)
    }

    private parseCode(codesheet: (key: string, language: string) => string, key: string): string {
        return codesheet(key, this.language);
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
発信官署: ${this.forecastOffice}
訓練等の識別符: ${this.drillType}
電文の発表時刻: ${this.reportTime}
電文がこの電文を含め何通あるか: ${this.numberOfTelegram}
コードが続くかどうか: ${this.isContinue}
地震発生時刻: ${this.earthquakeTime}
地震識別番号: ${this.id}
発表状況の指示: ${this.status}
発表する高度利用者向け緊急地震速報の番号: ${this.EEWID}`
        } else {
            let str = `電文種別: ${this.type}
発信官署: ${this.forecastOffice}
訓練等の識別符: ${this.drillType}
電文の発表時刻: ${this.reportTime}
電文がこの電文を含め何通あるか: ${this.numberOfTelegram}
コードが続くかどうか: ${this.isContinue}
地震発生時刻: ${this.earthquakeTime}
地震識別番号: ${this.id}
発表状況の指示: ${this.status}
発表する高度利用者向け緊急地震速報の番号: ${this.EEWID}
震央地名: ${this.epicenterName}
震央の位置: ${this.epicenterCoordinate}
震源の深さ(km): ${this.depth}
マグニチュード: ${this.magnitude}
最大予測震度: ${this.seismicIntensity}
震央の確からしさ: ${this.positionProbability}
震源の深さの確からしさ: ${this.depthProbability}
マグニチュードの確からしさ: ${this.magnitudeProbability}
震央の確からしさ(気象庁の部内システムでの利用): ${this.JMAPositionProbability}
震源の深さの確からしさ(気象庁の部内システムでの利用): ${this.probabilityOfDepthJMA}
震央位置の海陸判定: ${this.landOrSea}
警報を含む内容かどうか: ${this.isWarning}
最大予測震度の変化: ${this.isSeismicIntensityChanged}
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
        const telegramType = Definitions.TelegramTypeCode[telegramCode];
        if (telegramType === undefined) {
            throw new Error("電文の形式が不正です(電文種別コード)")
        } else {
            return telegramType;
        }
    }

    /** 発信官署 */
    get forecastOffice(): string {
        const officeCode = this.fastsub(3, 2);
        const from = Definitions.ForecastOfficeCode[officeCode];
        if (from === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_FORECAST_OFFICE);
        } else {
            return from;
        }
    }

    /** 訓練等の識別符 */
    get drillType(): string {
        const drillTypeCode = this.fastsub(6, 2);
        const drillType = this.parseCode(Definitions.DrillTypeCode, drillTypeCode);
        if (drillType === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DRILL_TYPE);
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
    get numberOfTelegram(): number {
        let number_of_telegram = this.fastsub(23, 1);
        return parseInt(number_of_telegram);
    }

    /** コードが続くかどうか */
    get isContinue(): boolean {
        const continueFlag = this.fastsub(24, 1);
        if (continueFlag === "1") {
            return true;
        } else if (continueFlag === "0") {
            return false;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_CONTINUE_FLAG);
        }
    }

    /** 地震発生時刻もしくは地震検知時刻 */
    get earthquakeTime(): Date {
        let time = `20${this.fastsub(26, 2)}-${this.fastsub(28, 2)}-${this.fastsub(30, 2)}T${this.fastsub(32, 2)}:${this.fastsub(34, 2)}:${this.fastsub(36, 2)}+09:00`;
        let earthquakeTime = new Date(time);
        return earthquakeTime;
    }

    /** 地震識別番号 */
    get id(): string {
        let id = this.fastsub(41, 14)
        if (!new RegExp(/[^\d]/).test(id)) {
            return id;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EARTHQUAKE_ID);
        }
    }

    /** 発表状況の指示 */
    get status(): string {
        const statusCode = this.fastsub(59, 1);
        const status = Definitions.StatusCode[statusCode];
        if (status === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_STATUS);
        } else {
            return status;
        }
    }

    /** 最終報 */
    get isFinal(): boolean {
        const finalFlag = this.fastsub(59, 1);
        if (finalFlag === "9") {
            return true;
        } else if (["0", "6", "7", "8", "/"].includes(finalFlag)) {
            return false;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_FINAL_FALG);
        }
    }

    /** 発表する高度利用者向け緊急地震速報の番号 */
    get EEWID(): number {
        let number = this.fastsub(60, 2)
        if (!new RegExp(/[^\d]/).test(number)) {
            return parseInt(number)
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EEW_ID);
        }
    }

    /** 震央の名称 */
    get epicenterName(): string {
        let key = this.fastsub(86, 3)
        if (!new RegExp(/[^\d]/).test(key)) {
            return Definitions.EpicenterCode[key];
        } else if (key == "///") {
            return null;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EPICENTER_NAME);
        }
    }

    /**
     * 震央の位置
     */
    get epicenterCoordinate(): string {
        let position = this.fastsub(90, 10)
        if (position == "//// /////") {
            return "不明"
        } else {
            if (!new RegExp(/[^\d|\s|N|E]/).test(position)) {
                return `${position[0]}${position[1]}${position[2]}.${position[3]}${position[4]}${position[5]}${position[6]}${position[7]}${position[8]}.${position[9]}`
            } else {
                throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EPICENTER_COORDINATE);
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
                throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DEPTH);
            }
        }
    }

    get magnitude() {
        let magnitude = this.fastsub(105, 2)
        if (magnitude == "//") {
            return "不明";
        } else {
            if (!new RegExp(/[^\d]/).test(magnitude)) {
                return parseFloat(`${magnitude[0]}.${magnitude[1]}`);
            } else {
                throw new TelegramFormatInvalidError(Definitions.Errors.BAD_MAGNITUDE);
            }
        }
    }

    /**
     * 最大预测震度
     * 震源深度超过 150km 时，将会返回不明。
     */
    get seismicIntensity(): string {
        const intensity = this.fastsub(108, 2);
        const seismicIntensityText = Definitions.SeismicIntensity[intensity];
        if (seismicIntensityText === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_INTENSITY);
        } else {
            return seismicIntensityText;
        }
    }

    get positionProbability(): string {
        const positionProbabilityCode = this.fastsub(113, 1);
        const positionProbability = Definitions.PositionProbabilityCode[positionProbabilityCode];
        if (positionProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_POSITION_PROBABILITY);
        } else {
            return positionProbability;
        }
    }

    get depthProbability(): string {
        const depthProbabilityCode = this.fastsub(114, 1);
        const depthProbability = Definitions.DepthProbabilityCode[depthProbabilityCode];
        if (depthProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DEPTH_PROBABILITY);
        } else {
            return depthProbability;
        }
    }

    get magnitudeProbability(): string {
        const magnitudeProbabilityCode = this.fastsub(115, 1);
        const magnitudeProbability = Definitions.MagnitudeProbabilityCode[magnitudeProbabilityCode];
        if (magnitudeProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_MAGNITUDE_PROBABILITY); 
        } else {
            return magnitudeProbability;
        }
    }

    get magnitudeObservePoints(): string {
        const magnitudeObservePointsCode = this.fastsub(116, 1);
        const magnitudeObservePoints = Definitions.MagnitudeObservePointsCode[magnitudeObservePointsCode];
        if (magnitudeObservePoints === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_MAGNITUDE_OBSERVE_POINTS);
        } else {
            return magnitudeObservePoints;
        }
    }

    get JMAPositionProbability(): string {
        const JMAPositionProbabilityCode = this.fastsub(117, 1);
        const JMAPositionProbability = Definitions.JMAPositionProbabilityCode[JMAPositionProbabilityCode];
        if (JMAPositionProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_JMA_POSITION_PROBABILITY);
        } else {
            return JMAPositionProbability;
        }
    }


    /**
     * Whether the earthquake was happened on land.
     * 地震是否发生在陆地上
     */
    get isLand(): boolean {
        const landOrSeaFlag = this.fastsub(121, 1);
        return landOrSeaFlag === "0";
    }

    /**
     * Whether the earthquake was happened in sea.
     * 地震是否发生在海域
     */
    get isSea(): boolean {
        const landOrSeaFlag = this.fastsub(121, 1);
        return landOrSeaFlag === "1";
    }

    /**
     * Earthquake location (Land or sea)
     * 地震发生之位置(海陆位置)
     */
    get landOrSea(): string {
        const landOrSeaFlag = this.fastsub(121, 1);
        const landOrSea = Definitions.LandOrSeaCode[landOrSeaFlag];
        if (landOrSea === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_LAND_OR_SEA_FLAG);
        } else {
            return landOrSea;
        }
    }

    /**
     * If this EEW is a 'Warning'
     * 是否为EEW"警报"
     */
    get isWarning(): boolean {
        const warningFlag = this.fastsub(122, 1);
        return warningFlag === "1";
    }

    // get estimateMethod(): string {
    //     const estimateMethodCode = this.fastsub(123, 1);

    // }

    /**
     * Whether estimate intensity has changed.
     * 预测震度是否变化
     */
    get isSeismicIntensityChanged(): string {
        const seismicIntensityChangeFlag = this.fastsub(129, 1);
        const intensityChange = Definitions.SeismicIntensityChangeCode[seismicIntensityChangeFlag];
        if (intensityChange === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_SEISMIC_INTENSITY_CHANGE_FLAG);
        } else {
            return intensityChange;
        }
    }

    /**
     * Whether the maxinum estimate seismic intensity has increased by 1 or more.
     * 最大预测震度是否上升1或更多
     */
    get isMaximumSeismicIntensityIncreased(): boolean {
        const maximimSeismicIntensityChangeFlag = this.fastsub(129, 1);
        return maximimSeismicIntensityChangeFlag === "1";
    }

    /**
     * Whether the maximum estimate seismic intensity has decreased by 1 or more.
     * 最大预测震度是否下降1或更多
     */
    get isMaxinumSeismicIntensityDecreased(): boolean {
        const maximimSeismicIntensityChangeFlag = this.fastsub(129, 1);
        return maximimSeismicIntensityChangeFlag === "2";
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
            local["area_name"] = Definitions.AreaCode[local["area_code"]] // 地区名称
            if (!local["area_name"]) {
                throw new Error("電文の形式が不正でです(地域名称[EBI])")
            }
            /** 震度 */
            if (this.fastsub(i + 7, 2) == "//") {
                local["intensity"] = `${Definitions.SeismicIntensity[this.fastsub(i + 5, 2)]}以上`
            } else if (this.fastsub(i + 5, 2) == this.fastsub(i + 7, 2)) {
                local["intensity"] = Definitions.SeismicIntensity[this.fastsub(i + 5, 2)]
            } else {
                local["intensity"] = `${Definitions.SeismicIntensity[this.fastsub(i + 7, 2)]}～${Definitions.SeismicIntensity[this.fastsub(i + 5, 2)]}`
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