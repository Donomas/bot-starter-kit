import fs from 'fs';
import util from 'util';
import path from 'path';
const logDirPath = '../logs/';
const logFileName = `${formatDate(new Date())}.log`;
const maxLines = 10_000; // Максимум 10.000 строк в логах
const checkInterval = 10_000; // 10 секунд
let logFile = fs.createWriteStream(path.join(logDirPath, logFileName), { flags: 'a' });
const logStdout = process.stdout;
console.log = function (...args) {
    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const message = `[${now}] ${util.format(...args)}\n`;
    logFile.write(message);
    logStdout.write(message);
};
logFile.write('\n'.repeat(5) + (' '.repeat(25) + `НАЧАЛО ЗАПУСКА БОТА: [${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}]\n`).repeat(4));
console.error = console.log;
process.title = 'bot-starter-kit';
setInterval(trimLogFile, checkInterval);
async function trimLogFile() {
    try {
        const logFilePath = path.join(logDirPath, logFileName);
        const data = await fs.promises.readFile(logFilePath, 'utf8');
        const lines = data.split('\n');
        if (lines.length > maxLines) {
            // Закрыть текущий поток
            logFile.end();
            // Формирование нового имени файла с датой и временем
            const timestamp = `${formatDate(new Date())}  Время записи - ${formatTime(new Date())}`;
            const newLogFileName = `bot ${timestamp}.log`;
            const newLogFilePath = path.join(logDirPath, newLogFileName);
            // Переименовать текущий файл
            await fs.promises.rename(logFilePath, newLogFilePath);
            // Открыть поток заново
            logFile = fs.createWriteStream(logFilePath, { flags: 'a' });
        }
    }
    catch (err) {
        console.error(err);
    }
}
function formatDate(now) {
    return now.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Moscow' }).replace(/\//g, '-');
}
function formatTime(now) {
    return now.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Moscow' });
}
