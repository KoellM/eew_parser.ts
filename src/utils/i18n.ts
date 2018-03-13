import ja from '../messages/ja';
import zh_cn from '../messages/zh-cn';

export const i18nMessages = {
    ja,
    'zh-ch': zh_cn
}

export function getMessageText(keys: string[], messages: object): string {
    if (keys.length === 1) {
        return messages[keys[0]];
    } else {
        const firstKey = keys.shift();
        return getMessageText(keys, messages[firstKey]);
    }
}

export default function makeI18n(language: string): (messageKey: string, lang?: string) => string {
    return ((messageKey: string, lang: string = language) => {
        const path = messageKey.split('.');
        return getMessageText(path, i18nMessages[language]);
    });
}