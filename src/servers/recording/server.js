import fs from 'fs';
import tmp from 'tmp';
import Mic from 'mic';
import path from 'path';

import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../common/logger';
import SocketServer from '../../common/socketServer';

export default class RecordingServer extends SocketServer {

    micInst = {};
    micStream = {};

    tempfile = '';
    recording = false;

    constructor() {
        super(settings.server.port.recording);
        this.onMessage(this.parseMessage.bind(this));
    }

    parseMessage(payload, ip, ws, req) {

        let message = {
            type: '',
            record: {
                rate: 0,
                channels: 0
            },
            save: {
                filename: ''
            }
        };

        try {

            message = JSON.parse(payload);

            switch(message.type) {
                case 'record':
                    this.record(message.record);
                    break;
                case 'stop':
                    this.stop();
                    break;
                case 'pause':
                    this.pause();
                    break;
                case 'resume':
                    this.resume();
                    break;
                case 'save':
                    this.save(message.save);
                    break;
                case 'discard':
                    this.discard();
                    break;
            }

        } catch(e) {
            logger.error(e);
        }
    }

    record(opts) {

        opts = opts || {};

        let channels = opts.channels || 1;
        let sampleRate = opts.sampleRate || 44100;

        logger.info(`Start recording`);
        logger.debug(` > channels: ${channels}`);
        logger.debug(` > sampleRate: ${sampleRate}`);

        this.micInst = Mic({
            debug: false,
            fileType: 'wav',
            rate: sampleRate,
            channels: channels,
            exitOnSilence: 30
        });

        this.tempfile = tmp.fileSync().name;
        this.micStream = this.micInst.getAudioStream();
        this.micStream.pipe(fs.WriteStream(this.tempfile));

        logger.debug(` > tmpfile: ${this.tempfile}`);

        this.micStream.on('startComplete', () => {
            this.sendMessage({
                type: 'recording',
                path: this.tempfile
            });
            this.recording = true;
        });

        this.micStream.on('stopComplete', () => {
            this.sendMessage({
                type: 'stopped',
                path: this.tempfile
            });
            this.recording = false;
        });

        this.micStream.on('pauseComplete', () => {
            this.sendMessage({
                type: 'paused'
            });
        });

        this.micStream.on('resumeComplete', () => {
            this.sendMessage({
                type: 'resumed'
            });
        });

        this.micInst.start();
    }

    stop() {
        if (!this.recording) { return; }
        logger.info('Stop recording');
        this.micInst.stop();
    }

    pause() {
        if (!this.recording) { return; }
        logger.info('Pause recording');
        this.micInst.pause();
    }

    resume() {
        if (!this.recording) { return; }
        logger.info('Resume recording');
        this.micInst.resume();
    }

    save(opts) {

        if (this.recording) {
            this.micInst.stop();
        }

        opts = opts || {};
        let filename = opts.filename;
        let filepath = path.join(settings.path.user.audio, filename + '.raw');

        logger.info(`Save file: ${filename}`);
        logger.debug(` > path: `);

        fs.rename(this.tempfile, filepath, err => {

            if (err) {
                logger.error(err);
                return;
            }

            samples.insert({
                name: filename,
                path: filepath,
                created: Date.now()
            }, (err, sample) => {

                if (err) {
                    logger.error(err);
                    return;
                }

                this.sendMessage({
                    type: 'saved',
                    id: sample._id,
                    path: filepath
                });

            });

        });

    }

    discard() {
        if (!this.recording) { return; }
        this.stop();
        logger.info(`Discard file`);
        this.sendMessage({type: 'discarded'});
    }


}