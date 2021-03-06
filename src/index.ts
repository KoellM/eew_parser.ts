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
     * @param telegram 电文
     * @param language 语言
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

    private parseCode(codesheet: (key: string, language: string) => string, key: string): string {
        return codesheet(key, this.language);
    }

    /**
     *  ==============
     *  共通头部属性解析
     *  ==============
     */

    /**
     * 电文类型
     */
    get type(): string {
        const telegramCode = utils.fastsub(this.parsedTelegram.header, 0, 2);
        const telegramType = Definitions.TelegramTypeCode[telegramCode];
        if (telegramType === undefined) {
            throw new Error("電文の形式が不正です(電文種別コード)")
        } else {
            return telegramType;
        }
    }

    /**
     * 电文是否为取消报
     */
    get isCancel(): boolean {
        return this.type === "キャンセル報";
    }

    /**
     * 电文发信官署
     */
    get forecastOffice(): string {
        const officeCode = utils.fastsub(this.parsedTelegram.header, 3, 2);
        const from = Definitions.ForecastOfficeCode[officeCode];
        if (from === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_FORECAST_OFFICE);
        } else {
            return from;
        }
    }

    /**
     * 训练识别符
     */
    get drillType(): string {
        const drillTypeCode = utils.fastsub(this.parsedTelegram.header, 6, 2);
        const drillType = this.parseCode(Definitions.DrillTypeCode, drillTypeCode);
        if (drillType === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_DRILL_TYPE);
        } else {
            return drillType;
        }
    }

    /**
     * 电文发表时间
     */
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

    /**
     * 该条电文是总体电文的第几部分
     */
    get partNumber(): number {
        let number_of_telegram = utils.fastsub(this.parsedTelegram.header, 23, 1);
        return parseInt(number_of_telegram);
    }

    /**
     * 是否有后续电文部分
     */
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

    /** 
     * 检测到地震的时间
     */
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

    /** 
     * 地震识别编号
     */
    get earthquakeId(): string {
        let id = utils.fastsub(this.parsedTelegram.forecast, 0, 16);
        if (!new RegExp(/ND[^\d]/).test(id)) {
            return id;
        } else {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_EARTHQUAKE_ID);
        }
    }

    /** 
     * 发表情况
     */
    get status(): string {
        const statusCode = utils.fastsub(this.parsedTelegram.forecast, 20, 1);
        const status = Definitions.StatusCode[statusCode];
        if (status === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_STATUS);
        } else {
            return status;
        }
    }

    /** 
     * 是否为最终报
     */
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

    /** 
     * 震央名称
     */
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
     * 震央坐标
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
     * 震源深度
     * @returns {string | number}
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
     * 震级
     * @returns {string | number}
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
     * 震源位置确定度
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
     * 震源深度确定度
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
     * 震级确定度
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
     * 震级观测点数
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
     * 震源位置确定度
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
     * 地震是否发生在陆地上
     */
    get isLand(): boolean {
        const landOrSeaFlag = utils.fastsub(this.parsedTelegram.forecast, 82, 1);
        return landOrSeaFlag === "0";
    }

    /**
     * 地震是否发生在海域
     */
    get isSea(): boolean {
        const landOrSeaFlag = utils.fastsub(this.parsedTelegram.forecast, 82, 1);
        return landOrSeaFlag === "1";
    }

    /**
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
     * 是否为EEW"警报"
     */
    get isWarning(): boolean {
        const warningFlag = utils.fastsub(this.rawTelegram, 56, 4);
        return warningFlag === "NCPN";
    }

    /**
     * 预报方法
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
     * 最大预测震度是否上升1或更多
     */
    get isMaximumSeismicIntensityIncreased(): boolean {
        const maximumSeismicIntensityChangeFlag = utils.fastsub(this.parsedTelegram.forecast, 91, 1);
        return maximumSeismicIntensityChangeFlag === "1";
    }

    /**
     * 最大预测震度是否下降1或更多
     */
    get isMaximumSeismicIntensityDecreased(): boolean {
        const maximumSeismicIntensityChangeFlag = utils.fastsub(this.parsedTelegram.forecast, 91, 1);
        return maximumSeismicIntensityChangeFlag === "2";
    }

    /**
     * 最大预测震度变化理由
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

    /**
     * 地区预计震度及到达时间
     */
    get ebi() {
        const result = [];
        if (this.parsedTelegram.forecast.indexOf('EBI') === -1) {
            return result;
        }
        const startIndex = this.parsedTelegram.forecast.indexOf('EBI') + 4;
        const ebiPart = this.parsedTelegram.forecast.slice(startIndex);
        let nowIndex = 0;
        while (nowIndex < ebiPart.length - 4) {
            const areaName = Definitions.AreaCode[utils.fastsub(ebiPart, nowIndex, 3)];
            const minimumSeismicIntensity = Definitions.SeismicIntensity[utils.fastsub(ebiPart, nowIndex + 5, 2)];
            const maximumSeismicIntensity = Definitions.SeismicIntensity[utils.fastsub(ebiPart, nowIndex + 7, 2)];
            const baseTime = this.earthquakeTime;
            let arrivalTime = undefined;
            if (utils.fastsub(ebiPart, nowIndex + 10, 6) !== "//////") {
                baseTime.setHours(parseInt(utils.fastsub(ebiPart, nowIndex + 10, 2)));
                baseTime.setMinutes(parseInt(utils.fastsub(ebiPart, nowIndex + 12, 2)));
                baseTime.setSeconds(parseInt(utils.fastsub(ebiPart, nowIndex + 14, 2)));
                arrivalTime = baseTime;
            }

            const typeCode = utils.fastsub(ebiPart, nowIndex + 17, 1);
            const arrivalCode = utils.fastsub(ebiPart, nowIndex + 18, 1);
            const type = Definitions.EBICode.TypeCode[typeCode];
            const arrival = Definitions.EBICode.ArrivalCode[arrivalCode];

            result.push({
                areaName,
                seismicIntensity: {
                    min: minimumSeismicIntensity,
                    max: maximumSeismicIntensity
                },
                arrivalTime,
                type,
                arrival
            });

            nowIndex += 20;
        }
        return result;
    }

    /**
     * ====================
     *      警报属性解析
     * ====================
     */

    /**
     * 警报编号
     */
    @warningOnly()
    get warningNumber(): number {
        const warningNumber = utils.fastsub(this.parsedTelegram.warning, 21, 2)
        if (warningNumber[0].charCodeAt(0) >= 65) {
            return (warningNumber[0].charCodeAt(0) - 55) * 10 + parseInt(warningNumber[1], 10);
        } else {
            return parseInt(warningNumber);
        }
    }

    /**
     * Warning Epicenter
     * 警报 震央
     * @returns {string}
     */
    @warningOnly()
    get warningEpicenter(): string {
        const warningEpicenterCode = utils.fastsub(this.parsedTelegram.warning, 24, 4);
        const warningEpicenter = Definitions.WarningEpicenterCode[warningEpicenterCode];
        if (warningEpicenter === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_WARNING_EPICENTER);
        } else {
            return warningEpicenter;
        }
    }

    // Region: 地方 Prefecture: 都道府県 Area: 地域

    /**
     * 是否增加了新的警报地方
     */
    @warningOnly()
    get hasAdditionalWarningRegion(): boolean {
        return utils.fastsub(this.parsedTelegram.warning, 47, 1) === "1";
    }

    /**
     * 是否增加了新的警报都道府県
     */
    @warningOnly()
    get hasAdditionalWarningPrefecture(): boolean {
        return utils.fastsub(this.parsedTelegram.warning, 48, 1) === "1";
    }

    /**
     * 是否增加了新的警报地域
     */
    @warningOnly()
    get hasAdditionalWarningArea(): boolean {
        return utils.fastsub(this.parsedTelegram.warning, 49, 1) === "1";
    }

    /**
     * 警报区域追加的理由
     * @returns {string}
     */
    @warningOnly()
    get additionReason(): string {
        const additionReasonCode = utils.fastsub(this.parsedTelegram.warning, 50, 1);
        const additionReason = Definitions.AdditionReason[additionReasonCode];
        if (additionReason === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_ADDITION_REASON);
        } else {
            return additionReason;
        }
    }

    /**
     * 警报区域预报方法
     * @returns {string}
     */
    @warningOnly()
    get warningForecastMethod(): string {
        const warningForecastMethodCode = utils.fastsub(this.parsedTelegram.warning, 51, 1);
        const warningForecastMethod = Definitions.WarningForecastMethodCode[warningForecastMethodCode];
        if (warningForecastMethod === undefined) {
            throw new TelegramFormatInvalidError(Definitions.Errors.BAD_WARNING_FORECAST_METHOD);
        } else {
            return warningForecastMethod;
        }
    }

    /**
     * 警报追加的地方
     */
    @warningOnly()
    get additionalWarningRegion(): string[] {
        const startIndex = this.parsedTelegram.warning.indexOf('CAI') + 4;
        const endIndex = this.parsedTelegram.warning.indexOf('CPI') - 1;
        const CAIPart = this.parsedTelegram.warning.slice(startIndex, endIndex);
        const result = [];
        for (const regionCode of CAIPart.split(/\s+/)) {
            if (regionCode === "0000" || regionCode === "////") {
                break;
            }
            result.push(Definitions.RegionCode[regionCode]);
        }
        return result;
    }

    /**
     * 警报追加的都道府県
     */
    @warningOnly()
    get additionalWarningPrefecture(): string[] {
        const startIndex = this.parsedTelegram.warning.indexOf('CPI') + 4;
        const endIndex = this.parsedTelegram.warning.indexOf('CBI') - 1;
        const CPIPart = this.parsedTelegram.warning.slice(startIndex, endIndex);
        const result = [];
        for (const prefectureCode of CPIPart.split(/\s+/)) {
            if (prefectureCode === "0000" || prefectureCode === "////") {
                break;
            }
            result.push(Definitions.PrefectureCode[prefectureCode]);
        }
        return result;
    }

    /**
     * 警报追加的地域
     */
    @warningOnly()
    get additionalWarningArea(): string[] {
        const startIndex = this.parsedTelegram.warning.indexOf('CBI') + 4;
        const endIndex = this.parsedTelegram.warning.indexOf('PAI') - 1;
        const CBIPart = this.parsedTelegram.warning.slice(startIndex, endIndex);
        const result = [];
        for (const areaCode of CBIPart.split(/\s+/)) {
            if (areaCode === "000" || areaCode === "///") {
                break;
            }
            result.push(Definitions.AreaCode[areaCode]);
        }
        return result;
    }

    /**
     * 警报地方
     */
    @warningOnly()
    get warningRegion(): string[] {
        const startIndex = this.parsedTelegram.warning.indexOf('PAI') + 4;
        const endIndex = this.parsedTelegram.warning.indexOf('PPI') - 1;
        const PAIPart = this.parsedTelegram.warning.slice(startIndex, endIndex);
        const result = [];
        for (const regionCode of PAIPart.split(/\s+/)) {
            if (regionCode === "0000" || regionCode === "////") {
                break;
            }
            result.push(Definitions.RegionCode[regionCode]);
        }
        return result;
    }

    /**
     * 警报都道府県
     */
    @warningOnly()
    get warningPrefecture(): string[] {
        const startIndex = this.parsedTelegram.warning.indexOf('PPI') + 4;
        const endIndex = this.parsedTelegram.warning.indexOf('PBI') - 1;
        const PPIPart = this.parsedTelegram.warning.slice(startIndex, endIndex);
        const result = [];
        for (const prefectureCode of PPIPart.split(/\s+/)) {
            if (prefectureCode === "0000" || prefectureCode === "////") {
                break;
            }
            result.push(Definitions.PrefectureCode[prefectureCode]);
        }
        return result;
    }

    /**
     * 警报地域
     */
    @warningOnly()
    get warningArea(): string[] {
        const startIndex = this.parsedTelegram.warning.indexOf('PBI') + 4;
        const endIndex = this.parsedTelegram.warning.lastIndexOf('NCP') - 1;
        const PBIPart = this.parsedTelegram.warning.slice(startIndex, endIndex);
        const result = [];
        for (const areaCode of PBIPart.split(/\s+/)) {
            if (areaCode === "000" || areaCode === "///") {
                break;
            }
            result.push(Definitions.AreaCode[areaCode]);
        }
        return result;
    }
}