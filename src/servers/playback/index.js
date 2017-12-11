
import path from 'path';
import Socket from 'ws';
import mkdirp from 'mkdirp';
import Daemon from 'start-stop-daemon';
import settings from '../../../settings';

import midi from '../../data/midi';
import samples from '../../data/samples';

const port = 8902;
const logPath = path.join(settings.path.user.logs, 'playback');

mkdirp.sync(logPath);

Daemon({
    outFile: path.join(logPath, 'out.log'),
    errFile: path.join(logPath, 'err.log'),
}, () => {

    let wss = new Socket.Server({ port: port });

});
