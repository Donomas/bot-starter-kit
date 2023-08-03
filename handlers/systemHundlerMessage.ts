import { LeftChatMemberContext, NewChatMembersContext } from 'puregram';

/**
 * Обработчик системных сообщений о присоединении или выходе участников из чата.
 * Автоматически удаляет системные сообщения, чтобы не засорять чат.
 *
 * @param {NewChatMembersContext | LeftChatMemberContext} context - Контекст сообщения, содержащий информацию о присоединении или выходе участника из чата.
 *
 * @returns {Promise<boolean>} Возвращает обещание, которое разрешается с результатом удаления сообщения. В случае ошибки может выбросить исключение.
 */
export const systemHandlerMessage = async (context: NewChatMembersContext | LeftChatMemberContext) => {
    // Моментально удаляем системное сообщение о присоединении или выходе из чата
    return context.delete({
        chat_id: context.chatId,
        message_id: context.id
    });
};