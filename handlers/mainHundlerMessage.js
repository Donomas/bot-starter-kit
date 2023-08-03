import { bot } from "../src/app.js";
/**
 * Главный обработчик сообщений для бота.
 * Обрабатывает различные команды и сценарии, такие как получение идентификатора чата и создание пригласительных ссылок.
 *
 * Можно удалить некоторые встроенные команды или добавить свои
 *
 * @param {MessageContext & StepContext<Record<string, any>>} context - Контекст сообщения и сценария, содержащий информацию о входящем сообщении.
 *
 * @returns {Promise<any>} Возвращает обещание, которое разрешается после завершения обработки. Может выбросить исключение в случае ошибки.
 */
export const mainHandlerMessage = async (context) => {
    // Проверка состояния сцены (если используется)
    console.log(context.scene.state);
    // Обработка команд для групповых чатов, каналов и супергрупп
    if (context.isGroup() || context.isChannel() || context.isSupergroup()) {
        // Получение ID чата
        if (context.text === '/getChat') {
            return context.send(`🔢 ID Чата: \`${context.chatId}\``, {
                parse_mode: 'MarkdownV2'
            });
        }
        // Создание пригласительной ссылки для добавления пользователей
        if (context.text === '/addUsers') {
            try {
                const response = await bot.api.createChatInviteLink({
                    name: 'Пригласительная для вступления аккаунтов',
                    chat_id: context.chatId,
                    expire_date: context.createdAt + 86400, // ссылка истекает через 1 день
                });
                return context.send(response.invite_link);
            }
            catch (error) {
                console.log(error);
            }
        }
        return true;
    }
    // Удаление сообщения, над которым бот работал, если команда "/start" вызвана когда вы в сцене
    if (context.text && /^\/start$/i.test(context.text) && context.scene.current) {
        const state = context.scene.state;
        if (state?.message_id && state?.chat_id) {
            await context.deleteMessage({
                chat_id: state.chat_id,
                message_id: state.message_id
            });
        }
        await context.scene.leave();
    }
    // Перезайти в основное меню
    if (context.text && /^\/start$/i.test(context.text)) {
        return context.scene.enter('Основная сцена');
    }
    // Если мы находимся в сцене, то входим в неё заново
    if (context.scene.current) {
        return context.scene.reenter();
    }
    // В случае неопознанной команды отправляем знак вопроса
    return context.send('?');
};
