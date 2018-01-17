import path from 'path';
import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../utils/logger';

import AudioTools from '../../utils/audioTools';
import SocketServer from '../../common/socketServer';

export default class RecordingServer extends SocketServer {

    constructor() {
        super(settings.server.port.playback);
        this.onMessage(this.parseMessage.bind(this));
    }

    parseMessage(payload, ip, ws, req) {

        let message = payload || {
            type: '',
            opts: {
                id: ''
            }
        };

        let opts = message.opts;

        logger.info(`Incoming request: ${message.type}`);

        switch(message.type) {

            case 'registerPreview':
                this.registerPreview(opts.id);
                break;

            case 'playPreview':
                break;

            case 'stopPreview':
                break;

        }

    }

    registerPreview(id) {
        logger.info(`Registering preview by id: ${id}...`);
        return new Promise((resolve, reject) => {
            samples.findOne({_id: id}, (err, sample) => {
                if (err) {
                    logger.notice(`Error while finding sample by id: ${id}`);
                    logger.error(err);
                    reject(err);
                    return;
                }
                let filepath = AudioTools.getSampleFilepath(sample);
                logger.info(`Registering preview filepath: ${filepath}`);
            });
        });
    }

    playPreview() {

    }

    stopPreview() {

    }

}