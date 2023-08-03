import { CallbackQueryContext } from "puregram";
import { StepContext } from "@puregram/scenes";

/**
 * Обработчик для обработки колбек-запросов внутри сцен.
 * Если текущая сцена активна, перезаходит в текущую сцену.
 * В противном случае отправляет уведомление пользователю о том, что что-то пошло не так.
 *
 * @param {CallbackQueryContext & StepContext} context - Контекст колбек-запроса, включая информацию о текущей сцене.
 *
 * @returns {Promise<void>} Возвращает обещание без значения. В случае ошибки может выбросить исключение.
 */
export const callbackHandler = async (context: CallbackQueryContext & StepContext) => {
    // Если текущая сцена активна, перезаходит в текущую сцену
    if (context.scene.current) {
        return context.scene.reenter();
    }

    // Отвечает на колбек-запрос уведомлением об ошибке
    return context.answerCallbackQuery({
        text: 'Что-то пошло не так....',
        show_alert: true
    });
};
