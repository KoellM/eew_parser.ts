import { expect } from 'chai';
import 'mocha';
import EEWParser from '../src/index';

const exampleWarningEEW = `47 03 00 061004150000 C11
061004145930
ND20061004145955 NCPN01
9762 N336 E1362 040
PRC0000/
CAI 0000
CPI 0000
CBI 000
PAI 9936 9941 9934 9943 9942
PPI 9240 9300 9180 9210 9220 9230 9250 9260 9270 9280 9290
9360 9370 9390 9330
PBI 462 551 550 461 400 401 432 442 443 450 451 460
500 501 510 511 520 521 531 532 535 540 600 601
610 630 631 581 611
NCP
ND20061004145955 NCN001 JD////////////// JN///
469 N336 E1362 040 69 6- RK33333 RT11/// RC0////
EBI 462 S6-5+ 150030 10 551 S6-5+ 150030 10 550 S5+5- 150035 10
461 S5-5- 150035 10 450 S0404 150050 10 451 S0404 150045 10
511 S0404 150045 10 520 S0404 150045 10 521 S0404 150040 10
531 S0404 150050 10 535 S0404 150045 10 540 S0404 150030 10
443 S0404 150050 10 400 S0404 150100 10 432 S0404 150055 10
460 S0404 150040 10 500 S0404 150055 10 501 S0404 150045 10
532 S0403 150055 10 600 S0403 150050 10 601 S0403 150050 10
610 S0403 150055 10 630 S0403 150055 10 401 S0403 150055 10
442 S0403 150100 10 510 S0403 150055 10 581 S0403 150100 10
611 S0403 150100 10 631 S0403 150100 10
9999=`;

const exampleEEW = `35 03 00 020117093014 C11
020117093010
ND20020117093012 NCN001 JD////////////// JN///
016 N343 E1384 010 // 5- RK118// RT00000 RC/////
9999=`;

describe('Parsing Non-Wanrning EEW / 非警报 EEW 解析', () => {
    const EEW = new EEWParser(exampleEEW);

    // 共通头部
    describe('Common Header Parsing / 共通头部解析', () => {
        it('Warning Flag / 警报判定', () => {
            expect(EEW.isWarning).to.equal(false);
        });

        it('Earthquake ID / 地震识别符', () => {
            expect(EEW.earthquakeId).to.equal('ND20020117093012');
        });

        it('Drill Type / 训练标记', () => {
            expect(EEW.drillType).to.equal('通常')
        });

        it('Telegram Type / 电文类型', () =>{
            expect(EEW.type).to.equal('最大予測震度のみの高度利用者向け緊急地震速報');
        });

        it('Forecast Office / 发信官署', () => {
            expect(EEW.forecastOffice).to.equal('東京');
        });

        it('Report Time / 发信时间', () => {
            expect(EEW.reportTime.toISOString()).to.equal('2002-01-17T00:30:14.000Z');
        });

        it('Part Number of Telegram / 长电文分部编号', () => {
            expect(EEW.partNumber).to.equal(1);
        });

        it('Continue Flag / 长电文继续标记', () => {
            expect(EEW.isContinue).to.equal(false);
        });

        it('Earthquake Time / 地震时间', () => {
            expect(EEW.earthquakeTime.toISOString()).to.equal('2002-01-17T00:30:10.000Z');
        })
    });

    describe('Forecast Parsing / 预报部分解析', () => {
        it('Earthquake ID / 地震识别编号', () => {
            expect(EEW.earthquakeId).to.equal('ND20020117093012');
        });
        it('EEW Status / EEW 发表状态', () => {
            expect(EEW.status).to.equal('通常発表');
            expect(EEW.isFinal).to.equal(false);
        });
        it('Forecast Number / 预报编号', () => {
            expect(EEW.forecastNumber).to.equal(1);
        });
        it('Epicenter Name / 震源地名', () => {
            expect(EEW.epicenterName).to.equal('東海地方');
        });
        it('Epicenter Coordinate / 震源坐标', () => {
            expect(EEW.epicenterCoordinate).to.equal('N34.3 E138.4');
        });
        it('Depth / 震源深度', () => {
            expect(EEW.depth).to.equal(10);
        });
        it('Magnitude / 震级', () => {
            expect(EEW.magnitude).to.equals('不明');
        });
        it('Maximum Seismic Intensity / 最大预测震度', () => {
            expect(EEW.maximumSeismicIntensity).to.equal('5弱');
        });
        it('Epicenter Position Probability / 震央位置确定度', () => {
            expect(EEW.epicenterPositionProbability).to.equal('P波/S波レベル超え、IPF法(1点)、または仮定震源要素[気象庁データ]');
        });
        it('Depth Probability / 震源深度确定度', () => {
            expect(EEW.depthProbability).to.equal('P波/S波レベル超え、IPF法(1点)、または仮定震源要素[気象庁データ]');
        });
        it('Magnitude Probability / 震级确定度', () => {
            expect(EEW.magnitudeProbability).to.equal('P波/S波レベル超え、または仮定震源要素[気象庁データ]');
        });
        it('Magnitude Observe Points / 震级观测点数', () => {
            expect(EEW.magnitudeObservePoints).to.equal('不明')
        });
        it('Hypocenter Position Probability / 震源位置确定度', () => {
            expect(EEW.hypocenterPositionProbability).to.equal('不明');
        });
        it('Land-sea Position / 海陆位置判断', () => {
            expect(EEW.isLand).to.equal(true);
            expect(EEW.isSea).to.equal(false);
            expect(EEW.landOrSea).to.equal('陸域')
        });
        it('Forecast Method / 预报首发', () => {
            expect(EEW.forecastMethod).to.equal('未設定');
        });
        it('Maximum Seismic Intensity Change Flag / 最大预测震度变化标记', () => {
            expect(EEW.isMaximumSeismicIntensityChanged).to.equal('不明');
            expect(EEW.isMaximumSeismicIntensityIncreased).to.equal(false);
            expect(EEW.isMaximumSeismicIntensityDecreased).to.equal(false);
        });
        it('Maximum Seismic Intensity Change Reason / 最大预测震度变化理由', () => {
            expect(EEW.maximumSeismicIntensityChangeReason).to.equal('不明、未設定時、キャンセル時');
        })
    });
});

describe('Parsing Warning EEW', () => {
   const EEW = new EEWParser(exampleWarningEEW);
    it('Warning Number', () => {
        expect(EEW.warningNumber).eq('01');
    })
});
