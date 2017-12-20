
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import logger from './logger';
import wavInfo from 'wav-file-info';
import samples from '../data/samples';
import settings from '../../settings';
import ChildProcess from 'child_process';

export default class AudioTools {

    /**
     * Moves an audio file from an existing location to the user folder,
     * using SOX to correct any issues with the audio file header. The
     * callback is executed when the move is completed.
     *
     * @param oldFilepath
     * @param newFilename
     * @param cb(<err>, <filepath>)
     */
    static moveToUserFolder(oldFilepath, newFilename, cb) {

        let fileidx = 0;
        let filename = fileidx + '.wav';
        let dirpath = path.join(settings.path.user.audio, newFilename) + '/';
        let filepath = path.join(dirpath, filename);

        mkdirp.sync(dirpath);

        ChildProcess.exec(`sox --ignore-length ${oldFilepath} ${filepath}`, err => {

            if (err) {
                logger.notice('Error moving file to user folder');
                logger.error(err);
            }

            if (!err) {
                fs.unlink(oldFilepath);
            }

            if (typeof cb === 'function') {
                cb(err, {
                    path: dirpath,
                    fileidx: fileidx,
                    filename: filename,
                    filepath: filepath
                });
            }
        });
    }

    static getWavFileInfo(filepath, cb) {
        wavInfo.infoByFilename(filepath, (err, info) => {
            if (err) {
                logger.notice('Error collecting info on wav file');
                logger.error(err);
            }
            cb(err, info);
        });
    }

    static getSampleFilepath(sample) {
        let filename = sample.current + sample.files[sample.current].format;
        return path.join(sample.path, filename);
    }

    static getSampleInfo(sample) {
        return sample.files[sample.current];
    }


}