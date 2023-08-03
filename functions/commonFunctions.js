import { CallbackQueryContext, MessageContext } from "puregram";
/**
 * Объект утилит, содержащий различные утилитарные функции.
 * @namespace
 * @property {function} random - Генерирует случайное число в заданном диапазоне.
 * @property {function} pick - Возвращает случайный элемент из массива.
 */
export const utils = {
    /**
     * Генерирует случайное число в заданном диапазоне.
     * @param x Нижняя граница или верхняя граница, если y не указано.
     * @param y Верхняя граница (необязательно).
     * @returns Случайное число.
     */
    random: (x, y) => {
        return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
    },
    /**
     * Возвращает случайный элемент из массива.
     * @param array Массив для выбора элемента.
     * @returns Случайный элемент массива.
     */
    pick: (array) => {
        return array[utils.random(array.length - 1)];
    }
};
/**
 * Генерирует случайный код из заданного набора символов.
 * @param length Длина кода (по умолчанию 20).
 * @returns Строковый код.
 */
export function generateRandomCode(length = 20) {
    let result = '';
    let text = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбюQWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789';
    text = text.split('');
    for (let i = 0; i < length; i++) {
        result += utils.pick(text);
    }
    return result;
}
/**
 * Разделяет число по разрядам, используя пробелы.
 * @param num Число или строковое представление числа.
 * @returns Строка с разделенными разрядами.
 */
export function separateNumberByDigits(num) {
    const inputString = typeof num === 'number' ? num.toString() : num;
    const [integerPart, fractionalPart] = inputString.split('.');
    const separatedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return fractionalPart ? `${separatedIntegerPart},${fractionalPart}` : separatedIntegerPart;
}
/**
 * Выбирает правильную форму слова для заданного числа.
 * @param n Число.
 * @param titles Массив форм слова (например, ['яблоко', 'яблока', 'яблок']).
 * @returns Правильная форма слова.
 */
export function decl(n, titles) {
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}
/**
 * Сокращает большие числа с заданным количеством знаков после запятой.
 * @param num Число для сокращения.
 * @param digits Количество знаков после запятой (по умолчанию 1).
 * @returns Сокращенное строковое представление числа.
 */
export function shortenLargeNum(num, digits = 1) {
    if (num < 1000) {
        return num.toString();
    }
    digits = (!digits || digits < 0) ? 0 : (digits > 100) ? 100 : digits;
    let units = ['тыс', 'млн', 'трлн', 'квдрл', 'квнтл'];
    let decimal;
    for (let i = units.length - 1; i >= 0; i--) {
        decimal = Math.pow(1000, ++i);
        if (num <= -decimal || num >= decimal) {
            return +(num / decimal).toFixed(digits) + units[i];
        }
    }
    return num.toString();
}
/**
 * Универсальная функция для отправки сообщений в рамках сцены.
 * Запоминает или изменяет текущее обрабатываемое сообщение, чтобы другие кнопки вне этого сообщения не работали.
 *
 * @param {ContextScene} context - Контекст сцены.
 * @param {string} text - Текст сообщения.
 * @param {InlineKeyboardBuilder} keyboard - Клавиатура с кнопками.
 */
export async function sendMessage(context, text, keyboard) {
    const result = context instanceof CallbackQueryContext
        ? await context.message?.editMessageText(text, { reply_markup: keyboard }).catch(console.error)
        : await context.send(text, { reply_markup: keyboard }).catch(console.error);
    if (result instanceof MessageContext) {
        context.scene.state.message_id = result.id;
        context.scene.state.chat_id = result.chat.id;
    }
}
/**
 * @function deleteMessage
 * @param {ContextScene} context - Контекст сообщения.
 * @description Удаляет текущее обрабатываемое сообщение.
 */
export async function deleteMessage(context) {
    try {
        await context.deleteMessage({
            chat_id: context.scene.state.chat_id,
            message_id: context.scene.state.message_id
        });
    }
    catch (error) {
        console.error("Failed to delete message", error);
    }
}
