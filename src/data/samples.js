import path from 'path';
import NeDB from 'nedb-multi';
import settings from '../../settings';

let DataStore = NeDB(settings.server.port.nedb);

let samples = new DataStore({
    filename: path.join(settings.path.user.data, 'samples.db'),
    autoload: true
});

export default samples;