#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let spawn = require('child_process').spawn;
let settings = require('../settings');

let filepath = process.argv[2];

if (!filepath) {
    console.log('Missing arguments. filepath');
    process.exit(1);
}

let inFile = path.resolve(filepath);
let pathInfo = path.parse(inFile);
let outFile = path.join(pathInfo.dir, pathInfo.name + '.dat');

let inst = spawn('audiowaveform', [
    '-i', inFile,
    '-o', outFile,
    '-z', 2,
    '-b', 8
]);

inst.on('close', code => {
    console.log(outFile);
    process.exit(code);
});