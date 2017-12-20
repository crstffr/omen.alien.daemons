import path from 'path';
import mkdirp from 'mkdirp';
import Daemon from 'start-stop-daemon';
import settings from '../../../settings';
import Server from './server';

const logPath = path.join(settings.path.user.logs, 'waveform');
mkdirp.sync(logPath);

Daemon({
    outFile: path.join(logPath, 'out.log'),
    errFile: path.join(logPath, 'err.log'),
}, () => {
    let server = new Server();
});
