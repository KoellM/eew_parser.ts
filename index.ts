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
    constructor(telegram: string){
        this.telegram = telegram;
    }

    private fastsub(start:number, num:number = 0): string {
        let numend:number = start + num
        return this.telegram.substring(start, numend)
    }

    static AreaCode() {
        const AreaCode = {
            0: "不明",
            135: "宗谷地方北部",
            136: "宗谷地方南部",
            125: "上川地方北部",
            126: "上川地方中部",
            127: "上川地方南部",
            130: "留萌地方中北部",
            131: "留萌地方南部",
            139: "北海道利尻礼文",
            150: "日高地方西部",
            151: "日高地方中部",
            152: "日高地方東部",
            145: "胆振地方西部",
            146: "胆振地方中東部",
            110: "檜山地方",
            105: "渡島地方北部",
            106: "渡島地方東部",
            107: "渡島地方西部",
            140: "網走地方",
            141: "北見地方",
            142: "紋別地方",
            165: "根室地方北部",
            166: "根室地方中部",
            167: "根室地方南部",
            160: "釧路地方北部",
            161: "釧路地方中南部",
            155: "十勝地方北部",
            156: "十勝地方中部",
            157: "十勝地方南部",
            119: "北海道奥尻島",
            120: "空知地方北部",
            121: "空知地方中部",
            122: "空知地方南部",
            100: "石狩地方北部",
            101: "石狩地方中部",
            102: "石狩地方南部",
            115: "後志地方北部",
            116: "後志地方東部",
            117: "後志地方西部",
            200: "青森県津軽北部",
            201: "青森県津軽南部",
            202: "青森県三八上北",
            203: "青森県下北",
            230: "秋田県沿岸北部",
            231: "秋田県沿岸南部",
            232: "秋田県内陸北部",
            233: "秋田県内陸南部",
            210: "岩手県沿岸北部",
            211: "岩手県沿岸南部",
            212: "岩手県内陸北部",
            213: "岩手県内陸南部",
            220: "宮城県北部",
            221: "宮城県南部",
            222: "宮城県中部",
            240: "山形県庄内",
            241: "山形県最上",
            242: "山形県村山",
            243: "山形県置賜",
            250: "福島県中通り",
            251: "福島県浜通り",
            252: "福島県会津",
            300: "茨城県北部",
            301: "茨城県南部",
            310: "栃木県北部",
            311: "栃木県南部",
            320: "群馬県北部",
            321: "群馬県南部",
            330: "埼玉県北部",
            331: "埼玉県南部",
            332: "埼玉県秩父",
            350: "東京都23区",
            351: "東京都多摩東部",
            352: "東京都多摩西部",
            354: "神津島",
            355: "伊豆大島",
            356: "新島",
            357: "三宅島",
            358: "八丈島",
            359: "小笠原",
            340: "千葉県北東部",
            341: "千葉県北西部",
            342: "千葉県南部",
            360: "神奈川県東部",
            361: "神奈川県西部",
            420: "長野県北部",
            421: "長野県中部",
            422: "長野県南部",
            410: "山梨県東部",
            411: "山梨県中・西部",
            412: "山梨県東部・富士五湖",
            440: "静岡県伊豆",
            441: "静岡県東部",
            442: "静岡県中部",
            443: "静岡県西部",
            450: "愛知県東部",
            451: "愛知県西部",
            430: "岐阜県飛騨",
            431: "岐阜県美濃東部",
            432: "岐阜県美濃中西部",
            460: "三重県北部",
            461: "三重県中部",
            462: "三重県南部",
            370: "新潟県上越",
            371: "新潟県中越",
            372: "新潟県下越",
            375: "新潟県佐渡",
            380: "富山県東部",
            381: "富山県西部",
            390: "石川県能登",
            391: "石川県加賀",
            400: "福井県嶺北",
            401: "福井県嶺南",
            500: "滋賀県北部",
            501: "滋賀県南部",
            510: "京都府北部",
            511: "京都府南部",
            520: "大阪府北部",
            521: "大阪府南部",
            530: "兵庫県北部",
            531: "兵庫県南東部",
            532: "兵庫県南西部",
            535: "兵庫県淡路島",
            540: "奈良県",
            550: "和歌山県北部",
            551: "和歌山県南部",
            580: "岡山県北部",
            581: "岡山県南部",
            590: "広島県北部",
            591: "広島県南東部",
            592: "広島県南西部",
            570: "島根県東部",
            571: "島根県西部",
            575: "島根県隠岐",
            560: "鳥取県東部",
            562: "鳥取県中部",
            563: "鳥取県西部",
            600: "徳島県北部",
            601: "徳島県南部",
            610: "香川県東部",
            611: "香川県西部",
            620: "愛媛県東予",
            621: "愛媛県中予",
            622: "愛媛県南予",
            630: "高知県東部",
            631: "高知県中部",
            632: "高知県西部",
            700: "山口県北部",
            702: "山口県西部",
            703: "山口県東部",
            704: "山口県中部",
            710: "福岡県福岡",
            711: "福岡県北九州",
            712: "福岡県筑豊",
            713: "福岡県筑後",
            750: "大分県北部",
            751: "大分県中部",
            752: "大分県南部",
            753: "大分県西部",
            730: "長崎県北部",
            731: "長崎県南西部",
            732: "長崎県島原半島",
            735: "長崎県対馬",
            736: "長崎県壱岐",
            737: "長崎県五島",
            720: "佐賀県北部",
            721: "佐賀県南部",
            740: "熊本県阿蘇",
            741: "熊本県熊本",
            742: "熊本県球磨",
            743: "熊本県天草・芦北",
            760: "宮崎県北部平野部",
            761: "宮崎県北部山沿い",
            762: "宮崎県南部平野部",
            763: "宮崎県南部山沿い",
            770: "鹿児島県薩摩",
            771: "鹿児島県大隅",
            774: "鹿児島県十島村",
            775: "鹿児島県甑島",
            776: "鹿児島県種子島",
            777: "鹿児島県屋久島",
            778: "鹿児島県奄美北部",
            779: "鹿児島県奄美南部",
            800: "沖縄県本島北部",
            801: "沖縄県本島中南部",
            802: "沖縄県久米島",
            803: "沖縄県大東島",
            804: "沖縄県宮古島",
            805: "沖縄県石垣島",
            806: "沖縄県与那国島",
            807: "沖縄県西表島"
        }
        return AreaCode
    }
    
    static EpicenterCode() {
        const EpicenterCode = {
            0: "不明",
            11: "北海道地方",
            12: "東北地方",
            13: "北陸地方",
            14: "関東甲信地方",
            15: "小笠原地方",
            16: "東海地方",
            17: "近畿地方",
            18: "中国地方",
            19: "四国地方",
            20: "九州地方",
            21: "沖縄地方",
            100: "石狩地方北部",
            101: "石狩地方中部",
            102: "石狩地方南部",
            105: "渡島地方北部",
            106: "渡島地方東部",
            107: "渡島地方西部",
            110: "檜山地方",
            115: "後志地方北部",
            116: "後志地方東部",
            117: "後志地方西部",
            120: "空知地方北部",
            121: "空知地方中部",
            122: "空知地方南部",
            125: "上川地方北部",
            126: "上川地方中部",
            127: "上川地方南部",
            130: "留萌地方中北部",
            131: "留萌地方南部",
            135: "宗谷地方北部",
            136: "宗谷地方南部",
            140: "網走地方",
            141: "北見地方",
            142: "紋別地方",
            145: "胆振地方西部",
            146: "胆振地方中東部",
            150: "日高地方西部",
            151: "日高地方中部",
            152: "日高地方東部",
            155: "十勝地方北部",
            156: "十勝地方中部",
            157: "十勝地方南部",
            160: "釧路地方北部",
            161: "釧路地方中南部",
            165: "根室地方北部",
            166: "根室地方中部",
            167: "根室地方南部",
            180: "北海道南西沖",
            181: "北海道西方沖",
            182: "石狩湾",
            183: "北海道北西沖",
            184: "宗谷海峡",
            185: "北海道北東沖(廃止)",
            186: "国後島付近",
            187: "択捉島付近",
            188: "北海道東方沖",
            189: "根室半島南東沖",
            190: "釧路沖",
            191: "十勝沖",
            192: "浦河沖",
            193: "苫小牧沖",
            194: "内浦湾",
            195: "宗谷東方沖",
            196: "網走沖",
            197: "択捉島南東沖",
            200: "青森県津軽北部",
            201: "青森県津軽南部",
            202: "青森県三八上北地方",
            203: "青森県下北地方",
            210: "岩手県沿岸北部",
            211: "岩手県沿岸南部",
            212: "岩手県内陸北部",
            213: "岩手県内陸南部",
            220: "宮城県北部",
            221: "宮城県南部",
            222: "宮城県中部",
            230: "秋田県沿岸北部",
            231: "秋田県沿岸南部",
            232: "秋田県内陸北部",
            233: "秋田県内陸南部",
            240: "山形県庄内地方",
            241: "山形県最上地方",
            242: "山形県村山地方",
            243: "山形県置賜地方",
            250: "福島県中通り",
            251: "福島県浜通り",
            252: "福島県会津",
            280: "津軽海峡",
            281: "山形県沖",
            282: "秋田県沖",
            283: "青森県西方沖",
            284: "陸奥湾",
            285: "青森県東方沖",
            286: "岩手県沖",
            287: "宮城県沖",
            288: "三陸沖",
            289: "福島県沖",
            290: "仙台湾(廃止)",
            300: "茨城県北部",
            301: "茨城県南部",
            309: "千葉県南東沖",
            310: "栃木県北部",
            311: "栃木県南部",
            320: "群馬県北部",
            321: "群馬県南部",
            330: "埼玉県北部",
            331: "埼玉県南部",
            332: "埼玉県秩父地方",
            340: "千葉県北東部",
            341: "千葉県北西部",
            342: "千葉県南部",
            349: "房総半島南方沖",
            350: "東京都23区",
            351: "東京都多摩東部",
            352: "東京都多摩西部",
            360: "神奈川県東部",
            361: "神奈川県西部",
            370: "新潟県上越地方",
            371: "新潟県中越地方",
            372: "新潟県下越地方",
            378: "新潟県下越沖",
            379: "新潟県上中越沖",
            380: "富山県東部",
            381: "富山県西部",
            390: "石川県能登地方",
            391: "石川県加賀地方",
            400: "福井県嶺北",
            401: "福井県嶺南",
            411: "山梨県中・西部",
            412: "山梨県東部・富士五湖",
            420: "長野県北部",
            421: "長野県中部",
            422: "長野県南部",
            430: "岐阜県飛騨地方",
            431: "岐阜県美濃東部",
            432: "岐阜県美濃中西部",
            440: "静岡県伊豆地方",
            441: "静岡県東部",
            442: "静岡県中部",
            443: "静岡県西部",
            450: "愛知県東部",
            451: "愛知県西部",
            460: "三重県北部",
            461: "三重県中部",
            462: "三重県南部",
            469: "三重県南東沖",
            470: "鹿島灘(廃止)",
            471: "茨城県沖",
            472: "関東東方沖",
            473: "千葉県東方沖",
            474: "房総半島南東沖(廃止)",
            475: "八丈島東方沖",
            476: "八丈島近海",
            477: "東京湾",
            478: "相模湾",
            479: "千葉県南方沖(廃止)",
            480: "伊豆大島近海",
            481: "伊豆半島東方沖",
            482: "三宅島近海",
            483: "新島・神津島近海",
            484: "伊豆半島南方沖(廃止)",
            485: "駿河湾",
            486: "駿河湾南方沖",
            487: "遠州灘",
            488: "東海道沖(廃止)",
            489: "三河湾",
            490: "伊勢湾",
            491: "熊野灘(廃止)",
            492: "若狭湾",
            493: "福井県沖",
            494: "石川県西方沖",
            495: "能登半島沖",
            496: "新潟県沖(廃止)",
            497: "富山湾",
            498: "佐渡付近",
            499: "東海道南方沖",
            500: "滋賀県北部",
            501: "滋賀県南部",
            510: "京都府北部",
            511: "京都府南部",
            520: "大阪府北部",
            521: "大阪府南部",
            530: "兵庫県北部",
            531: "兵庫県南東部",
            532: "兵庫県南西部",
            540: "奈良県",
            550: "和歌山県北部",
            551: "和歌山県南部",
            560: "鳥取県東部",
            562: "鳥取県中部",
            563: "鳥取県西部",
            570: "島根県東部",
            571: "島根県西部",
            580: "岡山県北部",
            581: "岡山県南部",
            590: "広島県北部",
            591: "広島県南東部",
            592: "広島県南西部",
            600: "徳島県北部",
            601: "徳島県南部",
            610: "香川県東部",
            611: "香川県西部",
            620: "愛媛県東予",
            621: "愛媛県中予",
            622: "愛媛県南予",
            630: "高知県東部",
            631: "高知県中部",
            632: "高知県西部",
            670: "紀伊半島沖(廃止)",
            671: "室戸岬沖(廃止)",
            672: "足摺岬沖(廃止)",
            673: "土佐湾",
            674: "紀伊水道",
            675: "大阪湾",
            676: "播磨灘",
            677: "瀬戸内海中部",
            678: "安芸灘",
            679: "周防灘",
            680: "伊予灘",
            681: "豊後水道",
            682: "山口県北西沖",
            683: "島根県沖",
            684: "鳥取県沖",
            685: "隠岐島近海",
            686: "兵庫県北方沖",
            687: "京都府沖",
            688: "淡路島付近",
            689: "和歌山県南方沖",
            700: "山口県北部",
            701: "山口県東部",
            702: "山口県西部",
            710: "福岡県福岡地方",
            711: "福岡県北九州地方",
            712: "福岡県筑豊地方",
            713: "福岡県筑後地方",
            720: "佐賀県北部",
            721: "佐賀県南部",
            730: "長崎県北部",
            731: "長崎県南西部",
            732: "長崎県島原半島",
            740: "熊本県阿蘇地方",
            741: "熊本県熊本地方",
            742: "熊本県球磨地方",
            743: "熊本県天草・芦北地方",
            750: "大分県北部",
            751: "大分県中部",
            752: "大分県南部",
            753: "大分県西部",
            760: "宮崎県北部平野部",
            761: "宮崎県北部山沿い",
            762: "宮崎県南部平野部",
            763: "宮崎県南部山沿い",
            770: "鹿児島県薩摩地方",
            771: "鹿児島県大隅地方",
            780: "対馬近海(廃止)",
            781: "福岡県西方沖(廃止)",
            782: "長崎県沖(廃止)",
            783: "五島列島近海",
            784: "天草灘",
            785: "有明海",
            786: "橘湾",
            787: "鹿児島湾",
            788: "鹿児島県西方沖(廃止)",
            789: "鹿児島県南西沖(廃止)",
            790: "種子島近海",
            791: "日向灘",
            792: "種子島東方沖(廃止)",
            793: "奄美大島近海",
            794: "奄美大島東方沖(廃止)",
            795: "壱岐・対馬近海",
            796: "福岡県北西沖",
            797: "薩摩半島西方沖",
            798: "トカラ列島近海",
            799: "奄美大島北西沖",
            820: "大隅半島東方沖",
            821: "九州地方南東沖",
            822: "種子島南東沖",
            823: "奄美大島北東沖",
            850: "沖縄本島近海",
            851: "南大東島近海",
            852: "沖縄本島南方沖",
            853: "宮古島近海",
            854: "石垣島近海",
            855: "石垣島南方沖",
            856: "西表島付近",
            857: "与那国島近海",
            858: "沖縄本島北西沖",
            859: "宮古島北西沖",
            860: "石垣島北西沖",
            900: "台湾付近",
            901: "東シナ海",
            902: "四国沖",
            903: "鳥島近海",
            904: "鳥島東方沖",
            905: "オホーツク海南部",
            906: "サハリン西方沖",
            907: "日本海北部",
            908: "日本海中部",
            909: "日本海西部",
            910: "日本海南西部(廃止)",
            911: "父島近海",
            912: "千島列島",
            913: "千島列島南東沖",
            914: "北海道南東沖",
            915: "東北地方東方沖",
            916: "小笠原諸島西方沖",
            917: "硫黄島近海",
            918: "小笠原諸島東方沖",
            919: "南海道南方沖",
            920: "薩南諸島東方沖",
            921: "本州南方沖",
            922: "サハリン南部付近",
            930: "北西太平洋",
            931: "フィリピン海北部(廃止)",
            932: "マリアナ諸島",
            933: "黄海",
            934: "朝鮮半島南部",
            935: "朝鮮半島北部",
            936: "中国東北部",
            937: "ウラジオストク付近",
            938: "シベリア南部",
            939: "サハリン近海",
            940: "アリューシャン列島",
            941: "カムチャツカ半島付近",
            942: "北米西部",
            943: "北米中部",
            944: "北米東部",
            945: "中米",
            946: "南米西部",
            947: "南米中部",
            948: "南米東部",
            949: "北東太平洋",
            950: "南太平洋",
            951: "インドシナ半島付近",
            952: "フィリピン付近",
            953: "インドネシア付近",
            954: "グアム付近",
            955: "ニューギニア付近",
            956: "ニュージーランド付近",
            957: "オーストラリア付近",
            958: "シベリア付近",
            959: "ロシア西部",
            960: "ロシア中部",
            961: "ロシア東部",
            962: "中央アジア",
            963: "中国西部",
            964: "中国中部",
            965: "中国東部",
            966: "インド付近",
            967: "インド洋",
            968: "中東",
            969: "ヨーロッパ西部",
            970: "ヨーロッパ中部",
            971: "ヨーロッパ東部",
            972: "地中海",
            973: "アフリカ西部",
            974: "アフリカ中部",
            975: "アフリカ東部",
            976: "北大西洋",
            977: "南大西洋",
            978: "北極付近",
            979: "南極付近"
    }
    return EpicenterCode
    }
    
    /** 返回电文 */
    getTelegram(): string {
        return this.telegram;
    }
    
    /** 返回紧急地震速报内容 */
    to_s(): string {
        if (this.type() == "キャンセル報") {
            return `
電文種別: ${this.type()}
発信官署: ${this.from()}
訓練等の識別符: ${this.drill_type()}
電文の発表時刻: ${this.report_time()}
電文がこの電文を含め何通あるか: ${this.number_of_telegram()}
コードが続くかどうか: ${this.continue()}
地震発生時刻もしくは地震検知時刻: ${this.earthquake_time()}
地震識別番号: ${this.id()}
発表状況の指示: ${this.status()}
発表する高度利用者向け緊急地震速報の番号: ${this.number()}`
        } else {
        let str = `電文種別: ${this.type()}
発信官署: ${this.from()}
訓練等の識別符: ${this.drill_type()}
電文の発表時刻: ${this.report_time()}
電文がこの電文を含め何通あるか: ${this.number_of_telegram()}
コードが続くかどうか: ${this.continue()}
地震発生時刻もしくは地震検知時刻: ${this.earthquake_time()}
地震識別番号: ${this.id()}
発表状況の指示: ${this.status()}
発表する高度利用者向け緊急地震速報の番号: ${this.number()}
震央地名: ${this.epicenter()}
震央の位置: ${this.position()}
震源の深さ: ${this.depth()}
マグニチュード: ${this.magnitude()}
最大予測震度: ${this.seismic_intensity()}
震央の確からしさ: ${this.probability_of_position()}
震源の深さの確からしさ: ${this.probability_of_depth()}
マグニチュードの確からしさ: ${this.probability_of_magnitude()}
震央の確からしさ(気象庁の部内システムでの利用): ${this.probability_of_position_jma()}
震源の深さの確からしさ(気象庁の部内システムでの利用): ${this.probability_of_depth_jma()}
震央位置の海陸判定: ${this.land_or_sea()}
警報を含む内容かどうか: ${this.warning()}
最大予測震度の変化: ${this.change()}
最大予測震度の変化の理由: ${this.reason_of_change()}`
    if(this.ebi().length) { 
        str += `
主要動到達までの時間及び最大予測震度`
        for (let ebi of this.ebi()) {
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
    type(): string {
        switch (this.fastsub(0, 2)) {
            case "35": 
                return "最大予測震度のみの高度利用者向け緊急地震速報"
            case "36":
                return "マグニチュード、最大予測震度及び主要動到達予測時刻の高度利用者向け緊急地震速報(B-Δ法、テリトリ法)"
            case "37":
                return "マグニチュード、最大予測震度及び主要動到達予測時刻の高度利用者向け緊急地震速報(グリッドサーチ法、EPOS自動処理手法)"
            case "39":
                return "キャンセル報"
            default:
                throw new Error("電文の形式が不正です(電文種別コード)")
        }
    }

    /** 発信官署 */
    from(): string {
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
                return "沖縄"
            default:
                throw new Error("電文の形式が不正です(発信官署)")
        }
    }

    /** 訓練等の識別符 */
    drill_type(): string {
        switch (this.fastsub(6, 2)) {
            case "00":
                return "通常"
            case "01":
                return "訓練"
            case "10":
                return "取り消し"
            case "11":
                return "訓練取り消し"
            case "20":
                return "参考情報またはテキスト"
            case "30":
                return "コード部のみの配信試験"
            default:
                throw new Error("電文の形式が不正です(識別符)")
        }
    }

    /** 電文の発表時刻 */
    report_time(): Date {
        let time = `20${this.fastsub(9, 2)}-${this.fastsub(11, 2)}-${this.fastsub(13, 2)}T${this.fastsub(15, 2)}:${this.fastsub(17, 2)}:${this.fastsub(19, 2)}+09:00`
        let report_time = new Date(time)
        return report_time
    }

    /** 電文がこの電文を含め何通あるか */
    number_of_telegram(): number {
        let number_of_telegram = this.fastsub(23, 1)
        if(!new RegExp(/[^\d]/).test(number_of_telegram)) {
            return parseInt(number_of_telegram); 
        } else {
            throw new Error("電文の形式が不正です")
        }
    }

    /** コードが続くかどうか */
    continue(): boolean {
        switch(this.fastsub(24, 1)) {
            case "1":
                return true
            case "0":
                return false
            default:
                throw new Error("電文の形式が不正です")
        }
    }
    
    /** 地震発生時刻もしくは地震検知時刻 */
    earthquake_time(): Date {
        let time = `20${this.fastsub(26, 2)}-${this.fastsub(28, 2)}-${this.fastsub(30, 2)}T${this.fastsub(32, 2)}:${this.fastsub(34, 2)}:${this.fastsub(36, 2)}+09:00`
        let earthquake_time = new Date(time)
        return earthquake_time
    }
    
    /** 地震識別番号 */
    id(): string {
        let id = this.fastsub(41, 14)
        if(!new RegExp(/[^\d]/).test(id)) {
            return id
        } else {
            throw new Error("電文の形式が不正です(地震識別番号)")
        }
    }

    /** 発表状況の指示 */
    status(): string {
        switch(this.fastsub(59, 1)) {
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
    final(): boolean {
        switch(this.fastsub(59, 1)) {
            case "9":
                return true
            case "0": case "6": case "7": case "8": case "/":
                return false
            default:
                throw new Error("電文の形式が不正です")
        }
    }

    /** 発表する高度利用者向け緊急地震速報の番号 */
    number(): number {
        let number = this.fastsub(60, 2)
        if(!new RegExp(/[^\d]/).test(number)) {
            return parseInt(number)
        } else {
            throw new Error("電文の形式が不正です(高度利用者向け緊急地震速報の番号)")
        }
    }

    /** 震央の名称 */
    epicenter(): string {
        let key = this.fastsub(86, 3)
        if(!new RegExp(/[^\d]/).test(key)) {
            return EEWParser.EpicenterCode()[key]
        } else if(key == "///") {
            return null
        } else {
            throw new Error("電文の形式が不正です(震央の名称)")
        }
    }

    position(): string {
        let position = this.fastsub(90, 10)
        if(position == "//// /////") {
            return "不明"
        } else {
            if(!new RegExp(/[^\d|\s|N|E]/).test(position)) {
                return `${position[0]}${position[1]}${position[2]}.${position[3]}${position[4]}${position[5]}${position[6]}${position[7]}${position[8]}.${position[9]}`
            } else {
                throw new Error("電文の形式が不正です(震央の位置)")
            }
        }
    }

    depth() {
        let depth = this.fastsub(101, 3)
        if(depth == "///") {
            return "不明"
        } else {
            if(!new RegExp(/[^\d]/).test(depth)) {
                return parseInt(depth)
            } else {
                throw new Error("電文の形式が不正です(震源の深さ)")
            }
        }
    }

    magnitude() {
        let magnitude = this.fastsub(105, 2)
        if(magnitude == "//") {
            return "不明"
        } else {
            if(!new RegExp(/[^\d]/).test(magnitude)) {
                return parseFloat(`${magnitude[0]}.${magnitude[1]}`)
            } else {
                throw new Error("電文の形式が不正です(マグニチュード)")
            }
        }
    }

    to_seismic_intensity(str): string {
        switch(str) {
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

    seismic_intensity(): string {
        try {
            return this.to_seismic_intensity(this.fastsub(108, 2))
        } catch(e) {
            throw new Error("電文の形式が不正です(最大予測震度)")
        }
    }

    probability_of_position(): string {
        switch(this.fastsub(113, 1)) {
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

    probability_of_depth(): string {
        switch(this.fastsub(114, 1)) {
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

    probability_of_magnitude(): string {
        switch(this.fastsub(115, 1)) {
            case "1":
                return "未設定"
            case "2":
                return "防災科研システム[防災科学技術研究所データ]"
            case "3":
                return "全点P相(最大5点)[気象庁データ]"
            case "4":
                return "P相/全相混在[気象庁データ]"
            case "5":
                return "全点全相(最大5点)[気象庁データ]"
            case "6":
                return "EPOS[気象庁データ]"
            case "7":
                return "未設定"
            case "8":
                return "P波/S波レベル越え[気象庁データ]"
            case "9":
                return "予備"
            case "/":case "0":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(マグニチュードの確からしさ)")
        }
    }
    probability_of_position_jma(): string {
        switch(this.fastsub(116, 1)) {
            case "1":
                return "P波/S波レベル越え又はテリトリー法(1点)[気象庁データ]"
            case "2":
                return "テリトリー法(2点)[気象庁データ]"
            case "3":
                return "グリッドサーチ法(3点/4点)[気象庁データ]"
            case "4":
                return "グリッドサーチ法(5点)[気象庁データ]"
            case "5":case "6":case "7":case "8":case "9":case "0":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震央の確からしさ[気象庁の部内システムでの利用])")
        }
    }
    probability_of_depth_jma(): string {
        switch(this.fastsub(117, 1)) {
            case "1":
                return "P波/S波レベル越え又はテリトリー法(1点)[気象庁データ]"
            case "2":
                return "テリトリー法(2点)[気象庁データ]"
            case "3":
                return "グリッドサーチ法(3点/4点)[気象庁データ]"
            case "4":
                return "グリッドサーチ法(5点)[気象庁データ]"
            case "5":case "6":case "7":case "8":case "9":case "0":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震源の深さの確からしさ[気象庁の部内システムでの利用])")
        }
    }

    land_or_sea(): string {
        switch(this.fastsub(121, 1)) {
            case "0":
                return "陸域"
            case "1":
                return "海域"
            case "2":case "3":case "4":case "5":case "6":case "7":case "8":case "9":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(震央位置の海陸判定)")
        }
    }

    warning(): boolean {
        switch(this.fastsub(122, 1)) {
            case "0":case "2":case "3":case "4":case "5":case "6":case "7":case "8":case "9":case "/":
                return false
            case "1":
                return true
            default:
                throw new Error("電文の形式が不正です(警報の判別)")
        }
    }
    
    change(): string {
        switch(this.fastsub(129, 1)) {
            case "0":
                return "ほとんど変化無し"
            case "1":
                return "最大予測震度が1.0以上大きくなった"
            case "2":
                return "最大予測震度が1.0以上小さくなった"
            case "3":case "4":case "5":case "6":case "7":case "8":case "9":
                return "未設定"
            case "/":
                return "不明/未設定"
            default:
                throw new Error("電文の形式が不正です(最大予測震度の変化)")
        }
    }

    reason_of_change(): string {
      switch(this.fastsub(130, 1)) {
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
        case "5":case "6":case "7":case "8":case "9":
            return "未設定"
        case "/":
            return "不明/未設定"
        default:
            throw new Error("電文の形式が不正です(最大予測震度の変化の理由)")
      }
    }

    ebi() {
        let data = []
        if(this.fastsub(135, 3) != "EBI") {
            return data
        }
        let i = 139
        while (i+20 < this.getTelegram().length) {
            let local = {}
            local["area_code"] = this.fastsub(i, 3) // 地区代码
            local["area_name"] = EEWParser.AreaCode()[local["area_code"]] // 地区名称
            if(!local["area_name"]) {
                throw new Error("電文の形式が不正でです(地域名称[EBI])")
            }
            /** 震度 */
            if(this.fastsub(i+7, 2) == "//") {
                local["intensity"] = `${this.to_seismic_intensity(this.fastsub(i+5, 2))}以上`
            } else if(this.fastsub(i+5, 2) == this.fastsub(i+7, 2)) {
                local["intensity"] = this.to_seismic_intensity(this.fastsub(i+5, 2))
            } else {
                local["intensity"] = `${this.to_seismic_intensity(this.fastsub(i+7, 2))}～${this.to_seismic_intensity(this.fastsub(i+5, 2))}`
            }
            /** 预想到达时间 */
            if(this.fastsub(i+10, 6) == "//////") {
                local["arrival_time"] = null
            } else {
                local['arrival_time'] = new Date(`20${this.fastsub(26, 2)}-${this.fastsub(28, 2)}-${this.fastsub(30, 2)}T${this.fastsub(i+10, 2)}:${this.fastsub(i+12, 2)}:${this.fastsub(i+14, 2)}+09:00`)
            }
            /** 是否为警报地区 */
            switch(this.fastsub(i+17, 1)) {
                case "0":
                    local["warning"] = false
                    break;
                case "1":
                    local["warning"] = true
                    break;
                case "2":case "3":case "4":case "5":case "6":case "7":case "8":case "9":case "/":
                    local["warning"] = null
                    break;
                default:
                    throw new Error("電文の形式が不正でです(警報の判別[EBI])")
            }

            /** 是否到达 */
            switch(this.fastsub(i+18, 1)) {
                case "0":
                    local["arrival"] = false
                    break;
                case "1":
                    local["arrival"] = true
                    break;
                case "2":case "3":case "4":case "5":case "6":case "7":case "8":case "9":case "/":
                    local["arrival"] = null
                    break;
                default:
                    throw new Error("電文の形式が不正でです(主要動の到達予測状況[EBI])")
            }
            data.push(local)
            i+= 20
        }
        return data
    }
}