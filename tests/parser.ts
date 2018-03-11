import { expect } from 'chai';
import 'mocha';
import EEWParser from '../src/index';

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

});