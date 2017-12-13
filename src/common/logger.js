import Log from 'log';
let logLevel = process.env.ALIEN_LOG_LEVEL || 'info';
export default new Log(logLevel);