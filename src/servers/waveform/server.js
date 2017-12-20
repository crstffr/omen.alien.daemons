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
                zoom: 0,
                width: 0,
                height: 0
            }
        };

        switch(message.type) {
            case 'generateDat':
                this.generateDat(message.opts);
                break;
        }

    }

    generateDat(opts) {

        if (!opts) { return; }

        samples.findOne({_id: opts.id}, function (err, sample) {

            if (err) {
                logger.notice(`Error while finding sample by id: ${opts.id}`);
                logger.error(err);
                return;
            }

            if (!sample) {
                logger.info(`Unable to find sample in DB by id: ${opts.id}`);
                return;
            }

            let filepath = AudioTools.getSampleFilepath(sample);

            Waveform.generateDat(filepath, () => {
                this.sendMessage({
                    type: 'datGenerated',
                    id: sample._id
                });
            });
        });

    }

}