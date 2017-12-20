#!/usr/bin/env node

require('rootpath')();
let path = require('path');
let spawn = require('child_process').spawn;
let settings = require('settings');

let width = process.argv[2];
let height = process.argv[3];
let filename = process.argv[4];
let zoom = process.argv[5] || 1;

if (!width || !height || !filename) {
    console.log('Missing arguments.  width height file [zoom]');
    process.exit(1);
}

let res = 8;
let info = require(path.join(settings.path.user.samples, filename, 'info.json'));
let inFilepath = path.join(settings.path.user.samples, filename, res + '.dat');

let outFilename = [width, height, zoom].join('-') + '.png';
let outFilepath = path.join(settings.path.user.waveforms, filename, 'png', outFilename);

let maxZoom = info.maxWidth / (settings.waveforms.zoomMultiplier * width);
zoom = (zoom === 'max') ? maxZoom : zoom;

if (zoom > maxZoom) {
    console.log('Exceeds maximum zoom of', Math.floor(maxZoom));
    process.exit(1);
}

let imgWidth = Math.floor(width * (settings.waveforms.zoomMultiplier * zoom - 1));
let imgZoom = Math.floor(info.frames / imgWidth);

let inst = spawn('audiowaveform', [
    '-i', inFilepath,
    '-o', outFilepath,
    '-w', imgWidth,
    '-z', imgZoom,
    '-h', height,
    '--border-color', '000000',
    '--background-color', '000000',
    '--waveform-color', 'FFFFFF',
    '--no-axis-labels'
]);

inst.stderr.on('data', data => {
    console.log(data.toString());
});

inst.on('close', code => {
    process.exit(code);
});