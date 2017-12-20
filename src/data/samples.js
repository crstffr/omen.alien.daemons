import path from 'path';
import NeDB from 'nedb-multi';
import settings from '../../settings';

let Datastore = NeDB(settings.server.port.nedb);

let samples = new Datastore({
    filename: path.join(settings.path.user.data, 'samples.db')
});

samples.loadDatabase();

export default samples;