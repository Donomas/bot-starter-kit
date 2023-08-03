import { CallbackQueryContext } from 'puregram';
import { NextMiddleware } from "middleware-io";

/**
 * Обработчик обратного вызова для обработки нажатия на встроенную кнопку.
 * Обрабатывает только первоначальное нажатие на кнопку и игнорирует все последующие нажатия,
 * пока первоначальное нажатие не будет обработано.
 *
 * @param {CallbackQueryContext} context - Контекст обратного вызова, содержащий информацию о входящем нажатии на кнопку.
 * @param {NextMiddleware} next - Функция, которая вызывается для передачи выполнения следующему обработчику в цепочке.
 * @param {Record<string, boolean>} lockUsers - Объект для отслеживания блокировки пользователей. Ключи представляют идентификаторы пользователей, а значения указывают, заблокирован ли пользователь от последующих нажатий.
 *
 * @returns {Promise<void>} Возвращает обещание, которое разрешается после завершения обработки. Может выбросить исключение в случае ошибки.
 */
export const intermediateHandlerCallback = async (context: CallbackQueryContext, next: NextMiddleware, lockUsers: Record<string, boolean>) => {
    if (lockUsers[context.senderId]) {
        return context.answerCallbackQuery({ text: '' });
    }
    lockUsers[context.senderId] = true;
    try {
        await next();
    }
    finally {
        delete lockUsers[context.senderId];
    }
};