import i18n from '../utils/i18n';

export default function(key: string, language: string): string {
    const _ = i18n(language);
    const drillTypeCode = {
        "00": _('drillType.normal'),
        "01": _("drillType.drill"),
        "10": _("drillType.cancelled"),
        "11": _("drillType.drillCancelled"),
        "20": _("drillType.test"),
        "30": _("drillType.codeTest")
    };
    return drillTypeCode[key];
}