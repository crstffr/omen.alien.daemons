#!/usr/bin/env node

require('rootpath')();
let path = require('path');
let spawnSync = require('child_process').spawnSync;
let settings = require('settings');

let width = process.argv[2];
let height = process.argv[3];
let filename = process.argv[4];
let zoom = process.argv[5] || 1;

if (!width || !height || !filename) {
    console.log('Missing arguments.  width height file [zoom]');
    process.exit(1);
}

let datFilename = [width, height, zoom].join('-') + '.dat';
let datFilepath = path.join(settings.path.user.waveforms, filename, 'dat', datFilename);
let result = spawnSync('tar', ['-xf', datFilepath, '-O']);
let waveform = result.stdout.toString();

process.stdout.write(waveform);