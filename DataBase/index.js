import fs from 'fs';
import path from 'path';
const dataDir = path.resolve('../DataBase');
// Чтение JSON файлов, а так же пересоздание при проблемах.
async function readJsonFile(filename) {
    const filePath = path.join(dataDir, filename);
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            console.log(err);
            // Если файл не существует, вернуть пустой массив
            return [];
        }
        else {
            // Если возникла другая ошибка, выбросить исключение
            throw err;
        }
    }
}
// Функция первоначального чтения данных, можно расширить на любое кол-во файлов.
async function loadData() {
    const [users] = await Promise.all([
        readJsonFile('users.json'),
    ]);
    return { users };
}
// Функция сохранения базы данных через временный файл для исключения проблем во время резкого отключения компьютера или сервера чтобы данные не были повреждены
async function saveData(tmpFilePath, finalFilePath, data) {
    try {
        await fs.promises.writeFile(tmpFilePath, JSON.stringify(data, null, '\t'));
        await fs.promises.rename(tmpFilePath, finalFilePath);
    }
    catch (error) {
        console.error("Ошибка при сохранении данных:", error);
        // Вы можете здесь добавить дополнительную логику восстановления или оповещения
    }
}
export { loadData, saveData };
