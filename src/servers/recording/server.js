import Capture from './capture';
import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../utils/logger';

import AudioTools from '../../utils/audioTools';
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

            case 'proc':
                switch (message.msg) {
                    case "started":
                        this.sendMessage({
                            type: 'started',
                            path: Capture.tempfile
                        });
                        break;
                    case "stopped":
                        this.sendMessage({
                            type: 'stopped'
                        });
                        break;
                }
                break;
        }

    }

    record(opts) {
        opts = opts || {};
        let channels = opts.channels || 2;
        logger.info(`Start recording`);
        logger.debug(` > channels: ${channels}`);
        Capture.start(channels);
    }

    stop() {
        Capture.stop();
    }

    discard() {
        Capture.discard(err => {
            this.sendMessage({
                type: 'discarded'
            });
        });
    }

    save(opts) {

        if (Capture.busy) {
            Capture.stop();
        }

        opts = opts || {};
        let filename = opts.filename;

        logger.info(`Save file: ${filename}`);
        logger.debug(` > from: ${Capture.tempfile}`);

        AudioTools.moveToUserFolder(Capture.tempfile, filename, (err, filepath) => {

            if (err) {
                logger.notice('Error moving tempfile to user folder')
                logger.error(err);
                return;
            }

            logger.debug(` > to path: ${filepath}`);

            AudioTools.getWavFileInfo(filepath, (err, info) => {

                info = info || {};
                logger.debug(` > info: ${info}`);

                samples.insert({
                    name: filename,
                    path: filepath,
                    info: info
                }, (err, sample) => {

                    if (err) {
                        logger.notice('Error inserting sample data into table');
                        logger.error(err);
                        return;
                    }

                    this.sendMessage({
                        type: 'saved',
                        id: sample._id,
                        path: filepath,
                        duration: info.duration
                    });
                });
            });
        });

    }
}