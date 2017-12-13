import fs from 'fs';
import tmp from 'tmp';
import path from 'path';
import logger from '../../common/logger';
import settings from '../../../settings';
import ChildProcess from 'child_process';

const hookPath = path.join(settings.path.user.root, 'hooks');

class Capture {

    proc = null;
    tempfile = null;

    constructor () {
        Object.defineProperty(this, 'busy', {
            get: () => this.proc !== null
        });
    }

    start(channels) {

        channels = channels || 2;

        if (this.proc) {
            this.discard();
        }

        this.tempfile = tmp.fileSync().name;

        logger.info('Capture process starting');
        logger.debug(` > file: ${this.tempfile}`);
        logger.debug(` > hook path: ${hookPath}`);

        this.proc = ChildProcess.spawn('jack_capture', [
            '-as',                      // absolutely-silent
            '-ns',                      // ignore stdin
            '-b', 16,                   // bitdepth
            '-c', channels,             // channels
            '-p', 'system:capture*',    // ports
            '-fn', this.tempfile,       // file
            '-Ho', path.join(hookPath, 'recording-started.sh'),
            '-Hc', path.join(hookPath, 'recording-stopped.sh')
        ]);

        this.proc.on('close', code => {
            logger.info('Capture process closed');
            logger.debug(` > exited with code ${code}`);
            this.proc = null;
        });

        this.proc.on('error', err => {
            logger.notice('Capture process error');
            logger.error(err);
        });

        return this.tempfile;
    }

    stop() {
        if (this.proc) {
            logger.info('Capture process stopping');
            this.proc.kill('SIGTERM');
        }
    }

    discard(cb) {
        this.stop();
        if (this.tempfile) {
            logger.info('Removing captured tempfile');
            logger.debug(` > tempfile: ${this.tempfile}`);
            fs.unlink(this.tempfile, err => {
                if (err) {
                    logger.info('Unable to remove tempfile');
                    logger.debug(err);
                }
                if (typeof cb === "function") {
                    cb(err);
                }
            });
            this.tempfile = null;
        }
    }

}

// Only one capture can happen at a time, so appropriate for a singleton

let inst = new Capture();

export default inst;