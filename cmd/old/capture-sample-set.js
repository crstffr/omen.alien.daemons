#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let spawn = require('child_process').spawn;
let settings = require('../../settings');

let file = process.argv[2];
let zoom = process.argv[3];

if (!file || !zoom) {
    console.log('Missing arguments.  file zoom');
    process.exit(1);
}

let inFile = path.join(settings.path.user.audio, file);
let outFile = path.join(settings.path.user.images, file, zoom + '.dat');

let inst = spawn('audiowaveform', [
    '-i', inFile,
    '-o', outFile,
    '-z', zoom,
    '-b', 8
]);

inst.stderr.on('data', data => {
    console.log(data.toString());
});

inst.on('close', code => {
    process.exit(code);
});