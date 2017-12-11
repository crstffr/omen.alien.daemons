import Log from 'log';
let logLevel = process.env.OMEN_ALIEN_DAEMON_LOG_LEVEL || 'info';
export default new Log(logLevel);