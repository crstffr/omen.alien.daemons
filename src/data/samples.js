import path from 'path';
import NeDB from 'nedb-multi';
import settings from '../../settings';

let samples = new NeDB(settings.server.port.nedb)({
    filename: path.join(settings.path.user.data, 'samples.db'),
    autoload: true
});

export default samples;