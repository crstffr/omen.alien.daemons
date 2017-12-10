const nedb = require('nedb');
const settings = require('../../../settings');
const datadir = settings.path.user.data;

export let midi = new nedb({
    filename: path.join(datadir, 'midi.db'),
    autoload: true
});