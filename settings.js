
const path = require('path');
const mkdirp = require('mkdirp');
const root = require('app-root-dir').get() + '/';
const user = require('user-home') + '/.omen/alien/';

mkdirp.sync(user);

module.exports = {
    path: {
        root: root + '/',
        bin: path.join(root, 'cmd') + '/',
        user: {
            root: user,
            data: path.join(user, 'data') + '/',
            audio: path.join(user, 'audio') + '/'
        }
    },
    waveforms: {
        zoomMultiplier: 2,
        sampleResolution: 16 // this shouldn't change
    }
};