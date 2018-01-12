
const path = require('path');
const mkdirp = require('mkdirp');
const root = require('app-root-dir').get() + '/';
const user = require('user-home') + '/.omen/alien/';

let settings = {
    path: {
        root: root + '/',
        bin: path.join(root, 'cmd') + '/',
        user: {
            root: user,
            data: path.join(user, 'data') + '/',
            audio: path.join(user, 'audio') + '/',
        }
    },
    server: {
        port: {
            nedb: 8900,
            recording: 8901,
            playback: 8902,
            waveform: 8903,
            gpio: 8904,
            data: 8905
        }
    },
    waveform: {
        width: 800,
        height: 415,
        color: 'FFD000',
        zoomMultiplier: 2,
        sampleResolution: 16 // this shouldn't change
    }
};

module.exports = settings;

// Make sure our user paths exist.

mkdirp.sync(settings.path.user.root);
mkdirp.sync(settings.path.user.data);
mkdirp.sync(settings.path.user.audio);