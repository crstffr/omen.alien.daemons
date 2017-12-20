
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
            logs: path.join(user, 'logs') + '/',
            data: path.join(user, 'data') + '/',
            audio: path.join(user, 'audio') + '/',
            images: path.join(user, 'images') + '/'
        }
    },
    server: {
        port: {
            recording: 8901,
            playback: 8902,
            waveform: 8903,
            gpio: 8904
        }
    },
    waveforms: {
        zoomMultiplier: 2,
        sampleResolution: 16 // this shouldn't change
    }
};

module.exports = settings;

// Make sure our user paths exist.

mkdirp.sync(settings.path.user.root);
mkdirp.sync(settings.path.user.logs);
mkdirp.sync(settings.path.user.data);
mkdirp.sync(settings.path.user.audio);
mkdirp.sync(settings.path.user.images);