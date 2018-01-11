import settings from '../../../settings';
import samples from '../../data/samples';
import logger from '../../utils/logger';

import AudioTools from '../../utils/audioTools';
import SocketServer from '../../common/socketServer';

export default class WaveformServer extends SocketServer {

    constructor() {
        super(settings.server.port.data);
        this.onMessage(this.parseMessage.bind(this));
    }

    parseMessage(payload, ip, ws, req) {

        let message = payload || {
                type: '',
                opts: {
                    id: ''
                }
            };

        switch(message.type) {
            case 'getSample':
                this.getSampleById(message.opts.id)
                    .then(data => {
                        this.sendMessage({
                            type: 'sampleData',
                            info: data.info,
                            sample: data.sample,
                            filepath: data.filepath
                        });
                    })
                    .catch(e => {
                        this.sendMessage({
                            type: 'sampleData',
                            error: e,
                        });
                    });
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

}