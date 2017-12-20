#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let spawn = require('child_process').spawn;
let settings = require('../settings');

let waveform = settings.waveform;
let filepath = process.argv[2];
let maxZoom = process.argv[3];
let frames = process.argv[4];
let zoom = process.argv[5];

zoom = (zoom === 'max') ? maxZoom : zoom;

if (!filepath || !maxZoom || !frames || !zoom) {
    console.log('Missing arguments.  filepath maxZoom frames zoom');
    process.exit(1);
}

if (zoom > maxZoom) {
    console.log('Exceeds maximum zoom of:', Math.floor(maxZoom));
    process.exit(1);
}

let inFile = path.resolve(filepath);
let pathInfo = path.parse(inFile);
let datFilepath = path.join(pathInfo.dir, pathInfo.name + '.dat');

let outFilename = [pathInfo.name, zoom].join('-') + '.png';
let outFilepath = path.join(pathInfo.dir, outFilename);

let imgWidth = Math.floor(waveform.width * (waveform.zoomMultiplier * zoom - 1));
let imgZoom = Math.floor(frames / imgWidth);

let inst = spawn('audiowaveform', [
    '-i', datFilepath,
    '-o', outFilepath,
    '-w', imgWidth,
    '-z', imgZoom,
    '-h', waveform.height,
    '--border-color', '000000',
    '--background-color', '000000',
    '--waveform-color', 'FFFFFF',
    '--no-axis-labels'
]);

inst.on('close', code => {
    console.log(outFilepath);
    process.exit(code);
});