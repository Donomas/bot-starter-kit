import fs from 'fs';
import util from 'util';
const logFile = fs.createWriteStream('../logs/bot.log', { flags: 'a' });
const logStdout = process.stdout;
console.log = function (...args) {
    const message = util.format(...args) + '\n';
    logFile.write(message);
    logStdout.write(message);
};
console.error = console.log;
process.title = 'bot-starter-kit';
