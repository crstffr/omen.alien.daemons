import fs from 'fs';
import tmp from 'tmp';
import logger from '../../common/logger';
import ChildProcess from 'child_process';

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

        logger.info('Capture process starting');
        logger.debug(` > file: ${this.tempfile}`);

        this.tempfile = tmp.fileSync().name;

        this.proc = ChildProcess.spawn('jack_capture', [
            '-as',                      // absolutely-silent
            '-ns',                      // ignore stdin
            '-b', 16,                   // bitdepth
            '-c', channels,             // channels
            '-p', 'system:capture*',    // ports
            '-fn', this.tempfile        // file
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

    discard() {
        this.stop();
        if (this.tempfile) {
            logger.info('Deleting captured tempfile');
            logger.debug(` > tempfile: ${this.tempfile}`);
            try {
                fs.unlink(this.tempfile);
            } catch(e) {
                // unable to remove tmp file - no biggie.
            }
        }
    }

}

// Only one capture can happen at a time, so appropriate for a singleton

let inst = new Capture();

export default inst;