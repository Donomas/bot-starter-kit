import fs from 'fs/promises';
import path from 'path';
const dataDir = path.resolve('../DataBase');
// Чтение JSON файлов, а так же пересоздание при проблемах.
async function readJsonFile(filename) {
    const filePath = path.join(dataDir, filename);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
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
export { loadData };
