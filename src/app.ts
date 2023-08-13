import { CallbackQueryContext, MessageContext, Telegram } from 'puregram';
import { StepContext } from "@puregram/scenes";
import fs from 'fs';

import { ISpamObject, IUserConstructor } from "../interfaces/index.js";

import { loadData, saveData } from '../DataBase/index.js';
import { User } from "../helpers/user.js";

// Дополнительный обработчик inline-callback кнопок
import { intermediateHandlerCallback } from "../handlers/intermediateHandlerCallback.js";
// Дополнительный обработчик пользовательского ввода
import { intermediateHandlerMessage } from "../handlers/intermediateHandlerMessage.js";
// Обработчик системных сообщений в чатах
import { systemHandlerMessage } from "../handlers/systemHundlerMessage.js";
// Обработчик пользовательского ввода
import { mainHandlerMessage } from "../handlers/mainHundlerMessage.js";
// Обработчик inline-callback кнопок
import { callbackHandler } from "../handlers/callbackHundler.js";

// Получаем стандартный менеджер сценарий
import { sessionManager, sceneManager } from './index.js';

// Меняем наименование консоли и логирование
import './console.js';

/**
 * Объект, хранящий информацию о спаме от пользователей.
 * Ключи в этом объекте представляют идентификаторы пользователей.
 * @property {number} date - Время последнего сообщения от пользователя (в миллисекундах).
 * @property {boolean} notification - Флаг, указывающий, было ли уже отправлено уведомление о спаме.
 * Если время между сообщениями от пользователя менее 500 мс, вместо продолжения работы с пользователем будет отправлен ответ о том, что на него действует спам.
 */
const spam: Record<string, ISpamObject> = {};
/**
 * Объект для отслеживания блокировки пользователей. Ключи представляют идентификаторы пользователей, а значения указывают, заблокирован ли пользователь от последующих нажатий.
 */
const lockUsers: Record<string, boolean> = {};

export let users: User[];

export const settings = JSON.parse(fs.readFileSync('../settings.json', 'utf-8'));

export const bot = new Telegram({
    // Указываем токен бота через @BotFather
    token: settings.token,
    // Встроенная функция для группировки медиа-вложений
    mergeMediaEvents: true
});

// Моментально загружаем базу данных JSON и запускаем interval
(async function loadBase() {
    ({ users } = await loadData());

    users = users.map((user: IUserConstructor) => new User(user));

    setInterval(async () => {
        await saveData('../DataBase/users.json.tmp', '../DataBase/users.json', users.map(user => user.toSerializableObject()));
    }, 10_000);
})();

bot.updates.startPolling().catch(console.error);

bot.updates.on('new_chat_members', async (context) => systemHandlerMessage(context));
bot.updates.on('left_chat_member', async (context) => systemHandlerMessage(context));

bot.updates.on(['message', 'callback_query'], sessionManager.middleware);
bot.updates.on(['message', 'callback_query'], sceneManager.middleware);

bot.updates.on(['callback_query'], async (context, next) => intermediateHandlerCallback(context, next, lockUsers));
bot.updates.on(['callback_query'], async (context: CallbackQueryContext & StepContext) => callbackHandler(context));

bot.updates.on('message', async (context, next) => intermediateHandlerMessage(context, next, spam));
bot.updates.on('message', async (context: MessageContext & StepContext<Record<string, any>>) => mainHandlerMessage(context));