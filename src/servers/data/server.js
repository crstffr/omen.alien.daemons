import path from 'path';
import rimraf from 'rimraf';
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

            case 'getSampleData':
                this.getSampleData(opts.id)
                    .then(data => {
                        this.sendMessage({
                            id: opts.id,
                            type: 'sampleData',
                            sampleData: data
                        });
                    })
                    .catch(e => {
                        this.sendMessage({
                            id: opts.id,
                            type: 'sampleData',
                            error: e,
                        });
                    });
                break;

            case 'getSampleFilePath':
                this.getSampleFilePath(opts.id)
                    .then(filepath => {
                        this.sendMessage({
                            type: 'sampleFilePath',
                            id: opts.id,
                            path: filepath
                        });
                    })
                    .catch(e => {
                        this.sendMessage({
                            type: 'sampleFilePath',
                            id: opts.id,
                            error: e,
                        });
                    });
                break;

            case 'deleteSample':
                this.deleteSample(opts.id)
                    .then(data => {
                        this.sendMessage({
                            type: 'sampleDeleted',
                            id: opts.id
                        });
                    })
                    .catch(e => {
                        this.sendMessage({
                            type: 'sampleDeleted',
                            id: opts.id,
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
                            id: opts.id,
                            error: e,
                        });
                    });
                break;
        }

    }

    getSampleFilePath(id) {
        logger.info(`Get sample filepath by id: ${id}...`);
        return this.getSampleData(id).then(data => data.filepath);
    }

    getSampleData(id) {
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
                    id: sample._id,
                    name: sample.name,
                    filename: sample.filename,
                    info: AudioTools.getSampleInfo(sample),
                    filepath: AudioTools.getSampleFilepath(sample),
                });
            });
        });
    }

    deleteSample(id) {
        logger.info(`Deleting sample by id: ${id}...`);
        return new Promise((resolve, reject) => {
            this.getSampleData(id).then(data => {
                let filepath = path.join(settings.path.user.audio, data.filename, '/');
                logger.info(`Deleting files in: ${filepath}`);
                rimraf(filepath, err => {
                    if (err) {
                        logger.notice(`Error while removing user data files for sample id: ${id}`);
                        logger.error(err);
                        reject(err);
                        return;
                    }
                    samples.remove({_id: id}, err => {
                        if (err) {
                            logger.notice(`Error while removing database record for sample id: ${id}`);
                            logger.error(err);
                            reject(err);
                            return;
                        }
                        logger.info(`Successfully deleted sample with id: ${id}`);
                        resolve();
                    });
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