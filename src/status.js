
// Get status of all the Omen Alien Daemon servers at once.

const proc = require('child_process');

let daemons = {
    'RecordingDaemon': './servers/recording/index.js',
    'WaveformDaemon': './servers/waveform/index.js'
    //'TransformDaemon': './servers/transform/index.js',
    //'PlaybackDaemon': './servers/playback/index.js',
};

console.log(`Getting Status...`);
Object.keys(daemons).forEach(function(key) {
    proc.execFile('node', [daemons[key], 'status'], function(err, out) {
        console.log(key + ': ' + out);
    });
});