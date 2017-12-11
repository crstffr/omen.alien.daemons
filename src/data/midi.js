import path from 'path';
import NeDB from 'nedb';
import settings from '../../settings';

let midi = new NeDB({
    filename: path.join(settings.path.user.data, 'midi.db'),
    autoload: true
});

export default midi;