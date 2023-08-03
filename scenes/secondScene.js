import { StepScene } from "@puregram/scenes";
import { CallbackQueryContext, DocumentAttachment, InlineKeyboardBuilder } from "puregram";
import fetch from 'node-fetch';
import { bot } from "../src/app.js";
import { deleteMessage, sendMessage } from "../functions/commonFunctions.js";
/** Первая пользовательская клавиатура */
const customKeyboardFirst = new InlineKeyboardBuilder()
    .textButton({ text: '🔙 Вернуться', payload: 'comeback' })
    .row()
    .textButton({ text: '↩️ Вернуться в основное меню', payload: 'comebackMainScene' });
/** Вторая пользовательская клавиатура */
const customKeyboardSecond = new InlineKeyboardBuilder()
    .textButton({ text: '🆕 Создать базу', payload: 'createData' })
    .row()
    .textButton({ text: '🔙 Вернуться', payload: 'comeback' })
    .row()
    .textButton({ text: '↩️ Вернуться в основное меню', payload: 'comebackMainScene' });
/** {number} Количество страниц в слайдере этой сцены */
const page = 5;
/** {string[]} Данные для слайдера */
const array = [
    '123',
    '321',
    '456',
    '654',
    '789',
    '987',
];
/**
 * @function callbackHandler
 * @param {CallbackQueryContext & StepContext<Record<string, any>>} context - Контекст колбек-запросов.
 * @description Улучшенный обработчик кнопок для использования дополнительных параметров.
 */
const callbackHandler = async (context) => {
    if (context.scene.state.message_id !== context.message?.id) {
        return context.answerCallbackQuery({
            text: '❌ Что-то пошло не так....',
            show_alert: true
        });
    }
    const commandHandlers = {
        comebackMainScene: async () => context.scene.enter('Основная сцена'),
        comebackStep: async (step) => context.scene.step.go(Number(step)),
        comeback: async () => context.scene.step.previous(),
        continue: async () => context.scene.step.next(),
        addData: async () => context.scene.step.go(1),
        next: async () => commandHandlers.sliderData(1),
        previous: async () => commandHandlers.sliderData(-1),
        sliderData: async (direction) => {
            const newChunk = context.scene.state.chunk + (page * direction);
            if (newChunk >= 0 && newChunk < array.length) {
                context.scene.state.chunk = newChunk;
            }
            else {
                await context.answerCallbackQuery({
                    text: '❌ Что-то пошло не так....',
                    show_alert: true
                });
            }
            return context.scene.step.go(context.scene.step.stepId);
        },
        createData: async () => {
            if (!context.scene.state.subscribers.length) {
                return context.answerCallbackQuery({
                    text: '❌ Вы не добавили пользователей',
                    show_alert: true
                });
            }
            let { name, subscribers } = context.scene.state;
            context.scene.state.subscribers = [];
            array.push(name);
            await context.answerCallbackQuery({
                text: '✅ Элемент был добавлен в бота.',
                show_alert: true
            });
            return context.scene.step.go(0);
        },
        checkData: async (name) => {
            if (!checkExistenceData(name)) {
                await context.answerCallbackQuery({
                    text: '❌ Базы с таким именем не существует.',
                    show_alert: true
                });
                return context.scene.step.go(context.scene.step.stepId);
            }
            context.scene.state.name = name;
            return context.scene.step.go(3);
        },
        deleteDataConfirm: async (name) => {
            if (!checkExistenceData(name)) {
                await context.answerCallbackQuery({
                    text: '❌ Базы с таким именем не существует.',
                    show_alert: true
                });
                return context.scene.step.go(0);
            }
            await context.answerCallbackQuery({
                text: '❗️ Требуется подтверждение действия',
                show_alert: false
            });
            return context.scene.step.go(4);
        },
        deleteData: async (name) => {
            if (!checkExistenceData(name)) {
                await context.answerCallbackQuery({
                    text: '❌ Базы с таким именем не существует.',
                    show_alert: true
                });
                return context.scene.step.go(0);
            }
            console.log(array.find(item => item === name));
            const index = array.findIndex(item => item === name);
            array.splice(index, 1);
            await context.answerCallbackQuery({
                text: '🗑 Вы удалили элемент с именем: ' + name,
                show_alert: true
            });
            return context.scene.step.go(0);
        }
    };
    const pattern = /^(\w+):?(.+?)?$/i;
    const match = context.data?.match(pattern);
    if (match) {
        const [, command, parameters] = match;
        // разделение строки параметров на отдельные элементы
        const paramsArray = parameters ? parameters.split(",") : [];
        if (commandHandlers[command]) {
            // передача параметров как отдельных аргументов функции
            return commandHandlers[command](...paramsArray);
        }
    }
    return context.answerCallbackQuery({
        text: '❌ Что-то пошло не так....',
        show_alert: true
    });
};
/**
 * @function checkExistenceData
 * @param {string} name - Имя кластера.
 * @returns {boolean} Возвращает булево значения существования кластера при обработке.
 */
function checkExistenceData(name) {
    return array.some(item => item === name);
}
/**
 * @function generateTextSlider
 * @param {number} chunk - Часть слайдера.
 * @param {number} page - Количество страниц.
 * @returns {string} Возвращает сгенерированный текст слайдера.
 */
function generateTextSlider(chunk, page) {
    let text = '\n';
    for (let i = chunk, a = 0; i < array.length && a < page; i++, a++) {
        const current = array[i];
        text += `${i + 1}. ${current}\n`;
    }
    return text;
}
/**
 * @function generateKeyboardSlider
 * @param {number} chunk - Часть слайдера.
 * @param {number} page - Количество страниц.
 * @returns {InlineKeyboardBuilder} Возвращает сгенерированную клавиатуру слайдера.
 */
function generateKeyboardSlider(chunk, page) {
    let keyboard = new InlineKeyboardBuilder();
    if (chunk > 0) {
        keyboard.textButton({ text: '◀', payload: 'previous' });
    }
    if (chunk + page < array.length) {
        keyboard.textButton({ text: '▶', payload: 'next' });
    }
    for (let i = chunk, a = 0; i < array.length && a < page; i++, a++) {
        const current = array[i];
        keyboard
            .row()
            .textButton({ text: current, payload: 'checkData:' + current });
    }
    keyboard
        .row()
        .textButton({ text: '➕ Добавить базу', payload: 'addData' })
        .row()
        .textButton({ text: '↩️ Вернуться в основное меню', payload: 'comebackMainScene' });
    return keyboard;
}
/**
 * @function generateKeyboard
 * @param {string} name - Имя.
 * @returns {InlineKeyboardBuilder} Возвращает клавиатуру которая должна менять данные в кнопке.
 */
function generateKeyboard(name) {
    let keyboard = new InlineKeyboardBuilder();
    keyboard
        .textButton({ text: '🗑 Удалить базу', payload: 'deleteDataConfirm:' + name })
        .row()
        .textButton({ text: '🔙 Вернуться', payload: 'comebackStep:0' })
        .row()
        .textButton({ text: '↩️ Вернуться в основное меню', payload: 'comebackMainScene' });
    return keyboard;
}
/**
 * @function generateKeyboardConfirm
 * @param {string} name - Имя.
 * @returns {InlineKeyboardBuilder} Возвращает сгенерированную клавиатуру для подтверждения.
 */
function generateKeyboardConfirm(name) {
    let keyboard = new InlineKeyboardBuilder();
    keyboard
        .textButton({ text: '🗑 Да', payload: 'deleteData:' + name })
        .textButton({ text: '🔙 Нет', payload: 'comebackStep:3' })
        .row()
        .textButton({ text: '↩️ Вернуться в основное меню', payload: 'comebackMainScene' });
    return keyboard;
}
/**
 * @function removeDuplicates
 * @param {typeof array} objectArray - Массив объектов.
 * @param {string[]} filterArray - Массив для фильтрации.
 * @returns {string[]} Возвращает новый отфильтрованный массив, основанный на filterArray.
 */
function removeDuplicates(objectArray, filterArray) {
    let set1 = new Set();
    // Добавляем все элементы в set1
    objectArray.forEach(item => {
        set1.add(item);
    });
    // возвращаем новый отфильтрованный массив, основанный на filterArray
    return filterArray.filter(item => !set1.has(item));
}
/**
 * Сцена "Проверка функционала" представляет собой универсальный инструмент для работы с массивом данных.
 * Включает в себя следующие возможности:
 * 1. Отображение элементов массива с помощью слайдера, позволяющего листать и просматривать содержимое.
 * 2. Выбор конкретного элемента из массива.
 * 3. Удаление выбранного элемента из массива.
 * 4. Добавление нового элемента в массив.
 *
 * Эта сцена может быть использована для различных типов массивов и данных,
 * предоставляя удобный интерфейс для взаимодействия с ними.
 *
 * @exports secondScene
 * @type {StepScene}
 */
export const secondScene = new StepScene('Проверка функционала', {
    steps: [
        /**
         * @description Показывает текущую страницу и общее количество элементов на странице
         */
        async (context) => {
            context.scene.state.chunk = context.scene.state.chunk || 0;
            if (context.scene.step.firstTime) {
                const count = array.length;
                const currentPage = Math.trunc((context.scene.state.chunk + page) / page);
                const allPage = Math.ceil(array.length / page === 0 ? 1 : array.length / page);
                const text = `ℹ️ Кол-во элементов:  ${count}
					📖 Страница: [${currentPage}/${allPage}]\n` + generateTextSlider(context.scene.state.chunk, page);
                const keyboard = generateKeyboardSlider(context.scene.state.chunk, page);
                return sendMessage(context, text, keyboard);
            }
            if (context instanceof CallbackQueryContext) {
                return callbackHandler(context);
            }
            return context.send('Действуй по сценарию.');
        },
        /**
         * @description Начало создания элемента и запрашивает имя элемента с проверкой длины и уникальности
         */
        async (context) => {
            const text = '🔤 Придумайте имя элемента.\n❗️ Не более 10 символов';
            if (context.scene.step.firstTime) {
                return sendMessage(context, text, customKeyboardFirst);
            }
            if (context instanceof CallbackQueryContext) {
                return callbackHandler(context);
            }
            if (!context.text) {
                return context.send('Напиши текст.');
            }
            if (context.text.length > 10) {
                return context.send('Меньше 10 символов....');
            }
            if (array.some(item => item === context.text)) {
                return context.send('элемент с таким именем уже СУЩЕСТВУЕТ!');
            }
            context.scene.state.name = context.text;
            await deleteMessage(context);
            return context.scene.step.next();
        },
        /**
         * @description Обработка текстовых файлов с пользователями и объединение их в общий массив
         */
        async (context) => {
            context.scene.state.subscribers = context.scene.state.subscribers || [];
            const text = `🔤 Имя элемента: ${context.scene.state.name}.\n👥 Вы добавили пользователей: ${context.scene.state.subscribers.length}\n\n❗️ Отправьте текстовый файл с пользователями.`;
            if (context.scene.step.firstTime) {
                return sendMessage(context, text, customKeyboardSecond);
            }
            if (context instanceof CallbackQueryContext) {
                return callbackHandler(context);
            }
            if (!context.hasAttachments('document')) {
                return context.send('Ты можешь добавлять только текстовые файлы.');
            }
            if (!context.isMediaGroup) {
                return false;
            }
            let documents = [];
            if (context.mediaGroup) {
                documents = context.mediaGroup.attachments.filter(item => item instanceof DocumentAttachment && item.mimeType?.includes('text/plain'));
            }
            else if (context.hasAttachment() && context.hasAttachmentType('document') && context.attachment.mimeType?.includes('text/plain')) {
                documents = [context.attachment];
            }
            // Проверяем, есть ли прикрепленные файлы
            if (documents.length === 0) {
                return context.send('Мне требуются текстовые файлы с короткими именами пользователей!');
            }
            console.log(documents);
            // Создаем массив промисов
            const promises = documents.map(async (document) => {
                const fileContent = await bot.api.getFile({ file_id: document.fileId });
                const filePath = fileContent.file_path;
                // Скачиваем файл
                const url = `https://api.telegram.org/file/bot${bot.options.token}/${filePath}`;
                const response = await fetch(url);
                const text = await response.text();
                //console.log(text);
                // Разбиваем текст на отдельные screen_name по пробелам и переносам строк
                return text.trim().split(/[\s\n]+/);
            });
            console.log(context);
            console.log(promises);
            // Ожидаем выполнения всех промисов
            try {
                const usernamesArrays = await Promise.all(promises);
                console.log(usernamesArrays);
                // Объединяем все массивы usernames в один
                const allUsernames = [].concat(...usernamesArrays);
                context.scene.state.subscribers.push(...allUsernames);
                context.scene.state.subscribers = [...new Set(context.scene.state.subscribers)];
                context.scene.state.subscribers = removeDuplicates(array, context.scene.state.subscribers);
                await deleteMessage(context);
                return context.scene.step.go(context.scene.step.stepId);
            }
            catch (error) {
                // Обрабатываем ошибки
                console.error(error);
            }
        },
        /**
         * @description Отображение имени элемента и предоставление возможности удалить базу
         */
        async (context) => {
            const text = `🔤 Имя элемента: ${context.scene.state.name}.`;
            if (context.scene.step.firstTime) {
                return sendMessage(context, text, generateKeyboard(context.scene.state.name));
            }
            if (context instanceof CallbackQueryContext) {
                return callbackHandler(context);
            }
            return context.send('Действуй по сценарию.');
        },
        /**
         * @description Запрос подтверждения удаления базы
         */
        async (context) => {
            const text = `❓ Вы действительно хотите удалить базу.`;
            if (context.scene.step.firstTime) {
                return sendMessage(context, text, generateKeyboardConfirm(context.scene.state.name));
            }
            if (context instanceof CallbackQueryContext) {
                return callbackHandler(context);
            }
            return context.send('Действуй по сценарию.');
        },
    ],
    /**
     * @description Обработчик, вызывающийся при выходе из сцены
     */
    leaveHandler: async (context) => {
        return console.log('leave');
    }
});
