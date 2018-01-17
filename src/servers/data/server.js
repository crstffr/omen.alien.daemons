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
                id: '',
                name: ''
            }
        };

        let opts = message.opts;

        logger.info(`Incoming request: ${message.type}`);

        switch(message.type) {

            case 'getSample':
                this.getSampleById(opts.id)
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

            case 'fetchAllSamples':
                this.fetchAllSamples()
                    .then(result => {
                        this.sendMessage({
                            type: 'allSamples',
                            sampleCollection: result,
                        });
                    })
                    .catch(e => {
                        this.sendMessage({
                            type: 'allSamples',
                            error: e,
                        });
                    });
                break;

            case 'renameSample':
                this.renameSample(opts.id, opts.name)
                    .then(data => {
                        this.sendMessage({
                            type: 'sampleRenamed',
                            id: opts.id
                        });
                    })
                    .catch(e => {
                        this.sendMessage({
                            type: 'sampleRenamed',
                            error: e,
                        });
                    });
                break;
        }

    }

    getSampleById(id) {
        logger.info(`Get sample by id: ${id}...`);
        return new Promise((resolve, reject) => {
            samples.findOne({_id: id}, (err, sample) => {
                if (err) {
                    logger.notice(`Error while finding sample by id: ${id}`);
                    logger.error(err);
                    reject(err);
                    return;
                }
                if (!sample) {
                    logger.info(`Unable to find sample in DB by id: ${id}`);
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

    fetchAllSamples() {
        logger.info(`Fetch all samples...`);
        return new Promise((resolve, reject) => {
            samples.find({}).sort({name: 1}).exec((err, samples) => {
                if (err) {
                    logger.notice(`Error while fetching all samples`);
                    logger.error(err);
                    reject(err);
                    return;
                }
                let result = samples.map(sample => {
                    return {
                        id: sample._id,
                        name: sample.name,
                        length: sample.files[sample.current].duration,
                        created: sample.files[sample.current].created || 0
                    }
                });
                logger.info(`Returning set of ${result.length} samples`);
                resolve(result);
            });
        });
    }

    renameSample(id, name) {
        return new Promise((resolve, reject) => {
            samples.update({_id: id}, {$set: {name: name}}, err => {
                if (err) {
                    logger.notice(`Error while renaming sample: ${id}, ${name}`);
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve();
                logger.info(`Renamed sample id ${id} to "${name}"`);
            });
        });
    }

}