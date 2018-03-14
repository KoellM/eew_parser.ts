import { expect } from 'chai';
import 'mocha';
import EEWParser from '../src/index';
import _ from '../src/utils/i18n';

describe('Parsing', () => {
    const EEW = new EEWParser(`37 03 00 170228165003 C11
170228164901
ND20170228164912 NCN913 JD////////////// JN///
289 N375 E1414 050 61 04 RK66554 RT10/// RC0////
EBI 251 S0404 ////// 01 250 S0404 ////// 01 221 S0404 ////// 01
220 S0404 ////// 01 222 S0404 ////// 01 242 S0404 ////// 01
300 S0403 ////// 01 252 S0403 ////// 01
9999=`);

    it('Earthquake ID', () => {
        expect(EEW.id).to.equal('20170228164912');
    });

    it('Drill Type', () => {
        expect(EEW.drillType).to.equal('通常')
    });

    it('Telegram Type', () =>{
        expect(EEW.type).to.equal('マグニチュード、最大予測震度及び主要動到達予測時刻の高度利用者向け緊急地震速報(グリッドサーチ法、EPOS自動処理手法)');
    });

    it('Forecast Office', () => {
        expect(EEW.forecastOffice).to.equal('東京');
    });

    it('Report Time', () => {
        expect(EEW.reportTime.toISOString()).to.equal('2017-02-28T07:50:03.000Z');
    });

    it('Number of Telegram', () => {
        expect(EEW.numberOfTelegram).to.equal(1);
    });

    it('Stringify', () => {
        console.log(_('ja', 'drillType.normal'));
    })
});
