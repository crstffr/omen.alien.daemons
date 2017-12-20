import Log from 'log';
let inst = new Log(process.env.ALIEN_LOG_LEVEL || 'info');
export default inst;