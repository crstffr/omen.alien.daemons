#!/usr/bin/env node

require('rootpath')();
let path = require('path');
let spawn = require('child_process').spawn;
let settings = require('settings');

let promises = [];
let filename = process.argv[2];
let program = path.join(settings.path.bin, 'capture-sample-set.js');

if (!filename) {
    console.log('Missing argument.  file');
    process.exit(1);
}

[8].forEach(zoom => {
    promises.push(new Promise((resolve, reject) => {
        let inst = spawn(program, [filename, zoom]);
        inst.on('close', code => {
            resolve(code);
        });
    }));
});

Promise.all(promises).then(() => {
    process.exit();
});
