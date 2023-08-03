import { StepContext, StepScene} from "@puregram/scenes";
import { CallbackQueryContext, InlineKeyboardBuilder, KeyboardBuilder, MessageContext } from "puregram";

import { sendMessage } from "../functions/commonFunctions.js";

// Универсальный тип для TS во время сценарий для устранения проблем с созданными параметрами по типу context.scene.state.message_id
type ContextScene = StepContext<Record<string, any>> & (MessageContext | CallbackQueryContext);

// Кнопки меню
const buttonMenu = new InlineKeyboardBuilder()
    .textButton({ text: 'ℹ️ Базовый функционал', payload: 'secondScene' })
    .row()
    .textButton({ text: '♿️ Пустышка', payload: 'none' });

// Обработчик для обработки колбек-запросов внутри сцены
const callbackHandler = async (context: CallbackQueryContext & StepContext<Record<string, any>>) => {
    if (context.scene.state.message_id !== context.message?.id) {
        return context.answerCallbackQuery({
            text: '❌ Что-то пошло не так....',
            show_alert: true
        });
    }
    if (context.data === 'secondScene') return context.scene.enter('Проверка функционала');

    return context.answerCallbackQuery({
        text: '❌ Что-то пошло не так....',
        show_alert: true
    });
};

// Конструктор сценария для основного меню
export const mainScene = new StepScene('Основная сцена', {
    steps: [
        async (context: ContextScene) => {
            const text = 'Основное меню:';

            if (context.scene.step.firstTime) {
                return sendMessage(context, text, buttonMenu);
            }
            if (context instanceof CallbackQueryContext) {
                return callbackHandler(context);
            }
            return context.send('Действуй по сценарию.');
        }
    ],
    leaveHandler: async (context: ContextScene) => {
        return console.log('leave');
    }
});
