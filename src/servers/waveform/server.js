import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../utils/logger';

import Waveform from './waveform';
import AudioTools from '../../utils/audioTools';
import SocketServer from '../../common/socketServer';

export default class WaveformServer extends SocketServer {

    constructor() {
        super(settings.server.port.waveform);
        this.onMessage(this.parseMessage.bind(this));
    }

    parseMessage(payload, ip, ws, req) {

        let message = payload || {
            type: '',
            opts: {
                id: '',
                zoom: 0
            }
        };

        switch(message.type) {
            case 'generateDat':
                this.generateDat(message.opts);
                break;

            case 'generatePng':
                this.generatePng(message.opts);
                break;
        }

    }

    getSampleById(id) {
        return new Promise((resolve, reject) => {

            samples.findOne({_id: id}, (err, sample) => {

                if (err) {
                    logger.notice(`Error while finding sample by id: ${opts.id}`);
                    logger.error(err);
                    reject(err);
                    return;
                }

                if (!sample) {
                    logger.info(`Unable to find sample in DB by id: ${opts.id}`);
                    reject('Sample not found');
                    return;
                }

                resolve({
                    sample: sample,
                    info: AudioTools.getSampleInfo(sample),
                    filepath: AudioTools.getSampleFilepath(sample)
                });
            });
        });
    }

    generateDat(opts) {

        if (!opts) { return; }

        this.getSampleById(opts.id).then(result => {

            let id = result.sample._id;

            Waveform.generateDat(result.filepath).then(datPath => {
                this.sendMessage({
                    type: 'datGenerated',
                    path: datPath,
                    id: id,
                });
            }).catch(e => {
                logger.error(e);
            });

        }).catch(e => {
            logger.error(e);
        });
    }

    generatePng(opts) {

        if (!opts) { return; }

        this.getSampleById(opts.id).then(result => {

            let id = result.sample._id;
            let idx = result.sample.current;
            let files = result.sample.files;

            let filepath = result.filepath;
            let frames = result.info.frames;
            let maxZoom = result.info.maxZoom;

            Waveform.generatePng(filepath, maxZoom, frames, opts.zoom).then(pngPath => {
                this.sendMessage({
                    type: 'pngGenerated',
                    zoom: opts.zoom,
                    path: pngPath,
                    id: id
                });
            }).catch(e => {
                logger.error(e);
            });

        }).catch(e => {
            logger.error(e);
        });
    }

}