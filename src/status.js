
// Get status of all the Omen Alien Daemon servers at once.

const proc = require('child_process');

let daemons = {
    'RecordingDaemon': './servers/recording/index.js',
    //'TransformDaemon': './servers/transform/index.js',
    //'PlaybackDaemon': './servers/playback/index.js',
    //'WaveformDaemon': './servers/waveform/index.js'
}

Object.keys(daemons).forEach(function(key) {
    console.log(`Status of ${key}...`);
    proc.execFile('node', [daemons[key], 'status'], function(err, out) {
        console.log('  ' + out);
    });
});