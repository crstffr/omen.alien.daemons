#!/usr/bin/env node

require('rootpath')();
let fs = require('fs');
let path = require('path');
let spawn = require('child_process').spawn;
let settings = require('settings');

let exit = false;
let file = process.argv[2];

if (!file) {
    console.log('Missing arguments. file');
    process.exit(1);
}

let inFile = path.join(settings.path.user.audio, file);
let outFile = path.join(settings.path.user.samples, file, 'info.dat');
let infoFile = path.join(settings.path.user.samples, file, 'info.json');

let result = '';
let inst = spawn('audiowaveform', [
    '-i', inFile,
    '-o', outFile,
    '-z', 256,
    '-b', 8
]);

inst.stdout.on('data', (data) => {
    result += data.toString();
});

inst.on('close', code => {

    let allData = {};

    result.split('\n').forEach(line => {
        let keyval = line.split(':');
        if (keyval.length === 2) {
            let val = keyval[1].trim();
            let key = keyval[0].trim().toLowerCase();
            allData[key] = val;
        }
    });

    let outData = {
        frames: Number(allData['frames']),
        channels: Number(allData['channels']),
        sampleRate: Number(allData['sample rate'].split(' ')[0])
    };

    // calculate length in milliseconds
    outData.length = Math.floor(outData.frames / outData.sampleRate * 1000);

    // calculate the maximum waveform width
    outData.maxWidth = Math.floor(outData.frames / settings.waveforms.sampleResolution);

    fs.write(fs.openSync(infoFile, 'w'), JSON.stringify(outData));
    fs.unlink(outFile);
    exit = true;
});

(function wait () {
    if (!exit) setTimeout(wait, 2);
})();