import fs from 'fs';
import path from 'path';
import logger from '../../utils/logger';
import settings from '../../../settings';
import ChildProcess from 'child_process';

const GEN_DAT_CMD = path.join(settings.path.bin, 'generate-waveform-dat.js');

class Waveform {

    static generateDat(filepath, cb) {

        logger.info(`Generate waveform dat for: ${filepath}`);

        ChildProcess.execFile(GEN_DAT_CMD, [filepath], err => {
            if (err) {
                logger.notice('Error while executing: generate-waveform-dat.js');
                logger.error(err);
                return;
            }
            if (typeof cb === 'function') {
                cb();
            }
        });
    }

}

export default Waveform;


