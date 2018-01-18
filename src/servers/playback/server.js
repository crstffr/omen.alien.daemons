import fs from 'fs';
import path from 'path';

import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../utils/logger';

import Speaker from 'speaker';
import bufferUtils from '../../utils/buffers';
import AudioTools from '../../utils/audioTools';
import SocketServer from '../../common/socketServer';

export default class RecordingServer extends SocketServer {

    speaker = null;
    previewBuffer = null;
    previewStream = null;

    constructor() {
        super(settings.server.port.playback);
        this.onMessage(this.parseMessage.bind(this));
        this.speaker = new Speaker();
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
                this.registerPreview(opts.id).then(() => {
                    this.sendMessage({
                        type: 'previewRegistered',
                        id: opts.id,
                    });
                });
                break;

            case 'playPreview':
                this.playPreview();
                break;

            case 'stopPreview':
                this.stopPreview();
                break;

        }

    }

    registerPreview(id) {

        if (this.previewStream !== null) {
            this.destroyPreview();
        }

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

                let stream = fs.createReadStream(filepath, {autoClose: false});

                bufferUtils.streamToBuffer(stream).then(buffer => {
                    this.previewBuffer = buffer;
                    logger.info(`Preview buffer size: ${this.previewBuffer.length}`);
                });

                /*
                this.previewStream.on('end', () => {
                    logger.info('preview buffer ended');
                });

                this.previewStream.on('error', err => {
                    logger.info('preview buffer error');
                    logger.error(err);
                });
                */

                resolve();
            });
        });
    }

    playPreview() {
        bufferUtils.bufferToStream(this.previewBuffer).pipe(this.speaker);
    }

    stopPreview() {
        // this.previewStream.pause();
    }

    destroyPreview() {
        //this.previewStream.unpipe();
        //this.previewStream.destroy();
        //this.previewStream = null;
    }

}