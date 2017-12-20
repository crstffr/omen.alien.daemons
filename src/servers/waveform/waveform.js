import fs from 'fs';
import path from 'path';
import logger from '../../utils/logger';
import settings from '../../../settings';
import ChildProcess from 'child_process';

const exec = ChildProcess.execFile;
const GEN_DAT_CMD = path.join(settings.path.bin, 'generate-waveform-dat.js');
const GEN_PNG_CMD = path.join(settings.path.bin, 'generate-waveform-png.js');

class Waveform {

    static generateDat(wavFilepath) {
        return new Promise((resolve, reject) => {
            exec(GEN_DAT_CMD, [wavFilepath], (err, result) => {
                if (err) {
                    logger.notice('Error while executing: generate-waveform-dat.js');
                    logger.error(err);
                    reject(err);
                    return;
                }
                logger.info(`Waveform dat generated: ${result}`);
                resolve();
            });
        });
    }

    static generatePng(wavFilepath, maxZoom, frames, zoom) {
        return new Promise((resolve, reject) => {
            exec(GEN_PNG_CMD, [wavFilepath, maxZoom, frames, zoom], (err, result) => {
                if (err) {
                    logger.notice('Error while executing: generate-waveform-png.js');
                    logger.error(err);
                    reject(err);
                    return;
                }
                logger.info(`Waveform png generated: ${result}`);
                resolve();
            });
        });
    }

}

export default Waveform;


