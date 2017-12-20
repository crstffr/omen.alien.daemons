
// Start all of the Omen Alien Daemon servers at once.

const proc = require('child_process');

let daemons = {
    'RecordingDaemon': './servers/recording/index.js',
    'WaveformDaemon': './servers/waveform/index.js'
    //'TransformDaemon': './servers/transform/index.js',
    //'PlaybackDaemon': './servers/playback/index.js',
};

Object.keys(daemons).forEach(function(key) {
    console.log(`Starting...`);
    proc.execFile('node', [daemons[key], 'start'], function(err, out) {
        console.log(key + ': ' + out);
    });
});