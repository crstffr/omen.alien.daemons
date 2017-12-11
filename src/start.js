
// Start all of the Omen Alien Daemon servers at once.

const proc = require('child_process');

let daemons = {
    'RecordingDaemon': './servers/recording/index.js',
    //'TransformDaemon': './servers/transform/index.js',
    //'PlaybackDaemon': './servers/playback/index.js',
    //'WaveformDaemon': './servers/waveform/index.js'
}

Object.keys(daemons).forEach(function(key) {
    console.log(`Starting ${key}...`);
    proc.execFile('node', [daemons[key], 'start'], function(err, out) {
        console.log('  ' + out);
    });
});