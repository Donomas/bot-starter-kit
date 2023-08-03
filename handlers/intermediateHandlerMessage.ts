import { MessageContext } from 'puregram';
import { NextMiddleware } from "middleware-io";
import { ISpamObject } from "../interfaces/index.js"; // Путь к вашему интерфейсу ISpamObject

/**
 * Промежуточный обработчик сообщений для отслеживания спама.
 *
 * @param {MessageContext} context - Контекст сообщения, содержащий информацию о входящем сообщении.
 * @param {NextMiddleware} next - Функция, которая вызывается для передачи выполнения следующему обработчику в цепочке.
 * @param {Record<string, ISpamObject>} spam - Объект для отслеживания спама от пользователей. Ключи представляют идентификаторы пользователей.
 *
 * @returns {Promise<boolean>} Возвращает true, если обработка успешно завершена. Может выбросить исключение в случае ошибки.
 */
export const intermediateHandlerMessage = async (context: MessageContext, next: NextMiddleware, spam: Record<string, any>) => {
    if (context.isGroup() || context.isSupergroup() || context.isChannel()) {
        return next();
    }

    const senderId = context.from?.id;
    if (!senderId) return true;

    spam[senderId] ??= { date: new Date().getTime(), notification: false };

    if (spam[senderId].date > new Date().getTime()) {
        spam[senderId].date = new Date().getTime() + 1000;
        if (!spam[senderId].notification) {
            spam[senderId].notification = true;
            return context.send('❗ Слишком много сообщений!');
        }
        return true;
    }

    spam[senderId].date = new Date().getTime() + 1000;
    spam[senderId].notification = false;

    try {
        await next();
    } catch (err) {
        throw err;
    }
    return true;
};