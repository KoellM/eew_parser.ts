import * as Definitions from './definitions';
import utils from './utils';

export class TelegramFormatInvalidError extends Error {
    constructor(message: string = Definitions.Errors.UNKNOWN_ERROR) {
        super(message);
        this.name = "telegram_format_invalid";
    }
}

export class InvalidPropertyError extends Error {
}

export interface ParsedTelegram {
    header: string;
    warning: string;
    forecast: string;
}

/**
 * Warning Only Property Decorator
 * @returns {(target, propertyKey: string, descriptor: PropertyDescriptor) => void}
 */
const warningOnly = () => (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalGet = descriptor.get;
    descriptor.get = function () {
        if (!this.isWarning) {
            throw new InvalidPropertyError("This property only exists on warning EEWs.")
        } else {
            return originalGet.call(this);
        }
    }
};
/**
 * eew_parser.ts
 * 高度利用者向紧急地震速报解析器
 * 解析方法来自 eew_parser(https://github.com/mmasaki/eew_parser)
 */
export default class EEWParser {
    private rawTelegram: string;
    private language: string;
    private parsedTelegram: ParsedTelegram = {
        header: "",
        warning: "",
        forecast: "",
    };

    /**
     * @param telegram
     * @param language
     */
    constructor(telegram: string, language: string = 'ja') {
        this.rawTelegram = telegram;
        this.language = language;
        if (this.isWarning) {
            const warningStartIndex = this.rawTelegram.indexOf('ND');
            const warningEndIndex = this.rawTelegram.lastIndexOf('ND');
            this.parsedTelegram.header = this.rawTelegram.slice(0, warningStartIndex - 1);
            this.parsedTelegram.warning = this.rawTelegram.slice(warningStartIndex, warningEndIndex - 1);
            this.parsedTelegram.forecast = this.rawTelegram.slice(warningEndIndex, this.rawTelegram.length - 1);
        } else {
            const forecastStartIndex = this.rawTelegram.indexOf('ND');
            this.parsedTelegram.header = this.rawTelegram.slice(0, forecastStartIndex - 1);
            this.parsedTelegram.forecast = this.rawTelegram.slice(forecastStartIndex, this.rawTelegram.length - 1);
        }
    }

    private fastsub(start: number, num: number = 0): string {
        const numend: number = start + num;
        return this.rawTelegram.substring(start, numend)
    }

    private parseCode(codesheet: (key: string, language: string) => string, key: string): string {
        return codesheet(key, this.language);
    }

    /** 返回电文 */
    getTelegram(): string {
        return this.rawTelegram;
    }

    /**
     *  ==============
     *  共通头部属性解析
     *  ==============
     */

    /** 电文类型 */
    get type(): string {
        const telegramCode = utils.fastsub(this.parsedTelegram.header, 0, 2);
        const telegramType = Definitions.TelegramTypeCode[telegramCode];
        if (telegramType === undefined) {
            throw new Error("電文の形式が不正です(電文種別コード)")
        } else {
            return telegramType;
        }
    }

    /** 発信官署 */
    get forecastOffice(): string {
        const officeCode = utils.fastsub(this.parsedTelegram.header, 3, 2);
        const from = Definitions.ForecastOfficeCode[officeCode];
        if (from === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_FORECAST_OFFICE);
        } else {
            return from;
        }
    }

    /** 訓練等の識別符 */
    get drillType(): string {
        const drillTypeCode = utils.fastsub(this.parsedTelegram.header, 6, 2);
        const drillType = this.parseCode(Definitions.DrillTypeCode, drillTypeCode);
        if (drillType === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DRILL_TYPE);
        } else {
            return drillType;
        }
    }

    /** 電文の発表時刻 */
    get reportTime(): Date {
        let time = `20${
            utils.fastsub(this.parsedTelegram.header, 9, 2)
        }-${
            utils.fastsub(this.parsedTelegram.header, 11, 2)
        }-${
            utils.fastsub(this.parsedTelegram.header, 13, 2)
        }T${
            utils.fastsub(this.parsedTelegram.header, 15, 2)
        }:${
            utils.fastsub(this.parsedTelegram.header, 17, 2)
        }:${
            utils.fastsub(this.parsedTelegram.header, 19, 2)
        }+09:00`;
        return new Date(time);
    }

    /** 電文がこの電文を含め何通あるか */
    get partNumber(): number {
        let number_of_telegram = utils.fastsub(this.parsedTelegram.header, 23, 1);
        return parseInt(number_of_telegram);
    }

    /** コードが続くかどうか */
    get isContinue(): boolean {
        const continueFlag = utils.fastsub(this.parsedTelegram.header, 24, 1);
        if (continueFlag === "1") {
            return false;
        } else if (continueFlag === "0") {
            return true;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_CONTINUE_FLAG);
        }
    }

    /** 地震発生時刻もしくは地震検知時刻 */
    get earthquakeTime(): Date {
        let time = `20${
            utils.fastsub(this.parsedTelegram.header, 26, 2)
        }-${
            utils.fastsub(this.parsedTelegram.header, 28, 2)
        }-${
            utils.fastsub(this.parsedTelegram.header, 30, 2)
        }T${
            utils.fastsub(this.parsedTelegram.header, 32, 2)
        }:${
            utils.fastsub(this.parsedTelegram.header, 34, 2)
        }:${
            utils.fastsub(this.parsedTelegram.header, 36, 2)
        }+09:00`;
        return new Date(time);
    }

    /** 地震識別番号 */
    get earthquakeId(): string {
        let id = utils.fastsub(this.parsedTelegram.forecast, 0, 16);
        if (!new RegExp(/ND[^\d]/).test(id)) {
            return id;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EARTHQUAKE_ID);
        }
    }

    /** 発表状況の指示 */
    get status(): string {
        const statusCode = utils.fastsub(this.parsedTelegram.forecast, 20, 1);
        const status = Definitions.StatusCode[statusCode];
        if (status === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_STATUS);
        } else {
            return status;
        }
    }

    /** 最終報 */
    get isFinal(): boolean {
        const finalFlag = utils.fastsub(this.parsedTelegram.forecast, 20, 1);
        if (finalFlag === "9") {
            return true;
        } else if (["0", "6", "7", "8", "/"].includes(finalFlag)) {
            return false;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_FINAL_FALG);
        }
    }

    /**
     * Forecast Number
     * 预报编号
     * @returns {number}
     */
    get forecastNumber(): number {
        const forecastNumber: string = utils.fastsub(this.parsedTelegram.forecast, 21, 2);
        if (forecastNumber[0].charCodeAt(0) >= 65) {
            return (forecastNumber[0].charCodeAt(0) - 55) * 10 + parseInt(forecastNumber[1], 10);
        } else {
            return parseInt(forecastNumber);
        }
    }

    /** 震央の名称 */
    get epicenterName(): string {
        let epicenterCode = utils.fastsub(this.parsedTelegram.forecast, 47, 3);
        if (!new RegExp(/[^\d]/).test(epicenterCode)) {
            return Definitions.EpicenterCode[parseInt(epicenterCode)];
        } else if (epicenterCode == "///") {
            return null;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EPICENTER_NAME);
        }
    }

    /**
     * 震央の位置
     */
    get epicenterCoordinate(): string {
        let position = utils.fastsub(this.parsedTelegram.forecast, 51, 10);
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

    /**
     * Depth
     * 震源深度
     * 震源の深さ
     * @returns {any}
     */
    get depth(): string | number {
        let depth = utils.fastsub(this.parsedTelegram.forecast, 62, 3);
        if (depth == "///") {
            return "不明";
        } else {
            if (!new RegExp(/[^\d]/).test(depth)) {
                return parseInt(depth);
            } else {
                throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DEPTH);
            }
        }
    }

    /**
     * Magnitude
     * 震级
     * マグニチュード
     * @returns {any}
     */
    get magnitude(): string | number {
        let magnitude = utils.fastsub(this.parsedTelegram.forecast, 66, 2)
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
    get maximumSeismicIntensity(): string {
        const intensity = utils.fastsub(this.parsedTelegram.forecast, 69, 2);
        const seismicIntensityText = Definitions.SeismicIntensity[intensity];
        if (seismicIntensityText === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_INTENSITY);
        } else {
            return seismicIntensityText;
        }
    }

    /**
     * Epicenter Position Probability
     * 震源位置确定度
     * 震央の確からしさ
     * @returns {string}
     */
    get epicenterPositionProbability(): string {
        const positionProbabilityCode = utils.fastsub(this.parsedTelegram.forecast, 74, 1);
        const positionProbability = Definitions.PositionProbabilityCode[positionProbabilityCode];
        if (positionProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_POSITION_PROBABILITY);
        } else {
            return positionProbability;
        }
    }

    /**
     * Depth Probability
     * 震源深度确定度
     * 震源の深さの確からしさ
     * @returns {string}
     */
    get depthProbability(): string {
        const depthProbabilityCode = utils.fastsub(this.parsedTelegram.forecast, 75, 1);
        const depthProbability = Definitions.DepthProbabilityCode[depthProbabilityCode];
        if (depthProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DEPTH_PROBABILITY);
        } else {
            return depthProbability;
        }
    }

    /**
     * Magnitude Probability
     * 震级确定度
     * マグニチュードの確からしさ
     * @returns {string}
     */
    get magnitudeProbability(): string {
        const magnitudeProbabilityCode = utils.fastsub(this.parsedTelegram.forecast, 76, 1);
        const magnitudeProbability = Definitions.MagnitudeProbabilityCode[magnitudeProbabilityCode];
        if (magnitudeProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_MAGNITUDE_PROBABILITY);
        } else {
            return magnitudeProbability;
        }
    }

    /**
     * Magnitude Observe Points
     * 震级观测点数
     * マグニチュード使用観測点
     * @returns {string}
     */
    get magnitudeObservePoints(): string {
        const magnitudeObservePointsCode = utils.fastsub(this.parsedTelegram.forecast, 77, 1);
        const magnitudeObservePoints = Definitions.MagnitudeObservePointsCode[magnitudeObservePointsCode];
        if (magnitudeObservePoints === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_MAGNITUDE_OBSERVE_POINTS);
        } else {
            return magnitudeObservePoints;
        }
    }

    /**
     * Hypocenter Position Probability
     * @returns {string}
     */
    get hypocenterPositionProbability(): string {
        const hypocenterPositionProbabilityCode = utils.fastsub(this.parsedTelegram.forecast, 78, 1);
        const JMAPositionProbability = Definitions.HypocenterPositionProbabilityCode[hypocenterPositionProbabilityCode];
        if (JMAPositionProbability === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_HYPOCENTER_POSITION_PROBABILITY);
        } else {
            return JMAPositionProbability;
        }
    }


    /**
     * Whether the earthquake was happened on land.
     * 地震是否发生在陆地上
     */
    get isLand(): boolean {
        const landOrSeaFlag = utils.fastsub(this.parsedTelegram.forecast, 82, 1);
        return landOrSeaFlag === "0";
    }

    /**
     * Whether the earthquake was happened in sea.
     * 地震是否发生在海域
     */
    get isSea(): boolean {
        const landOrSeaFlag = utils.fastsub(this.parsedTelegram.forecast, 82, 1);
        return landOrSeaFlag === "1";
    }

    /**
     * Earthquake location (Land or sea)
     * 地震发生之位置(海陆位置)
     */
    get landOrSea(): string {
        const landOrSeaFlag = utils.fastsub(this.parsedTelegram.forecast, 82, 1);
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
        const warningFlag = utils.fastsub(this.rawTelegram, 56, 4);
        return warningFlag === "NCPN";
    }

    /**
     * Forecast Method
     * 预报方法
     * 予測手法
     * @returns {string}
     */
    get forecastMethod(): string {
        const forecastMethodCode = utils.fastsub(this.parsedTelegram.forecast, 84, 1);
        const forecastMethod = Definitions.ForecastMethodCode[forecastMethodCode];
        if (forecastMethod === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_FORECAST_METHOD);
        } else {
            return forecastMethod;
        }
    }

    /**
     * Whether estimate intensity has changed.
     * 预测震度是否变化
     */
    get isMaximumSeismicIntensityChanged(): string {
        const seismicIntensityChangeFlag = utils.fastsub(this.parsedTelegram.forecast, 91, 1);
        const intensityChange = Definitions.SeismicIntensityChangeCode[seismicIntensityChangeFlag];
        if (intensityChange === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_SEISMIC_INTENSITY_CHANGE_FLAG);
        } else {
            return intensityChange;
        }
    }

    /**
     * Whether the maximum estimate seismic intensity has increased by 1 or more.
     * 最大预测震度是否上升1或更多
     */
    get isMaximumSeismicIntensityIncreased(): boolean {
        const maximumSeismicIntensityChangeFlag = utils.fastsub(this.parsedTelegram.forecast, 91, 1);
        return maximumSeismicIntensityChangeFlag === "1";
    }

    /**
     * Whether the maximum estimate seismic intensity has decreased by 1 or more.
     * 最大预测震度是否下降1或更多
     */
    get isMaximumSeismicIntensityDecreased(): boolean {
        const maximumSeismicIntensityChangeFlag = utils.fastsub(this.parsedTelegram.forecast, 91, 1);
        return maximumSeismicIntensityChangeFlag === "2";
    }

    /**
     * Seismic Intensity Change Reason
     * 最大预测震度变化理由
     * 最大予測震度の変化の理由
     * @returns {string}
     */
    get maximumSeismicIntensityChangeReason(): string {
        const seismicIntensityChangeReasonCode = utils.fastsub(this.parsedTelegram.forecast, 91, 1);
        const seismicIntensityChangeReason = Definitions.SeismicIntensityChangeReasonCode[seismicIntensityChangeReasonCode];
        if (seismicIntensityChangeReason === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_SEISMIC_INTENSITY_CHANGE_REASON);
        } else {
            return seismicIntensityChangeReason;
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
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "/":
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
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "/":
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

    /**
     * ====================
     *      警报属性解析
     * ====================
     */
    @warningOnly()
    get warningNumber(): string {
        return utils.fastsub(this.parsedTelegram.warning, 21, 2);
    }
}