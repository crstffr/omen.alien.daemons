import path from 'path';
import NeDB from 'nedb';
import settings from '../../../settings';

let samples = new NeDB({
    filename: path.join(settings.path.user.data, 'samples.db'),
    autoload: true
});

export default samples;