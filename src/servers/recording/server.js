import fs from 'fs';
import tmp from 'tmp';
import path from 'path';

import Capture from './capture';
import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../common/logger';
import SocketServer from '../../common/socketServer';

export default class RecordingServer extends SocketServer {

    constructor() {
        super(settings.server.port.recording);
        this.onMessage(this.parseMessage.bind(this));
    }

    parseMessage(payload, ip, ws, req) {

        let message = payload || {
            type: '',
            record: {
                channels: 0
            },
            save: {
                filename: ''
            }
        };

        switch(message.type) {
            case 'record':
                this.record(message.record);
                break;

            case 'stop':
                this.stop();
                break;

            case 'save':
                this.save(message.save);
                break;

            case 'discard':
                this.discard();
                break;
        }

    }

    record(opts) {

        opts = opts || {};

        let channels = opts.channels || 2;

        logger.info(`Start recording`);
        logger.debug(` > channels: ${channels}`);

        let tempfile = Capture.start(channels);

        this.sendMessage({
            type: 'recording',
            path: tempfile
        });

    }

    stop() {
        Capture.stop();
    }

    discard() {
        Capture.discard();
    }

    save(opts) {

        if (Capture.busy) {
            Capture.stop();
        }

        opts = opts || {};
        let filename = opts.filename;
        let filepath = path.join(settings.path.user.audio, filename + '.raw');

        logger.info(`Save file: ${filename}`);
        logger.debug(` > path: `);

        fs.rename(Capture.tempfile, filepath, err => {

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

}