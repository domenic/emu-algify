#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-process-exit */
'use strict';
const getStream = require('get-stream');
const yargs = require('yargs');
const emuAlgify = require('..');
const packageJson = require('../package.json');

const argv = yargs
  .usage(`${packageJson.description}\n\n${packageJson.name} [--throwing-indicators] < input.html > output.html`)
  .option('t', {
    alias: 'throwing-indicators',
    type: 'boolean',
    describe: 'Add throws/nothrow indicators to headings'
  })
  .help()
  .version()
  .argv;

getStream(process.stdin)
  .then(input => emuAlgify(input, { throwingIndicators: argv.throwingIndicators }))
  .then(output => console.log(output))
  .catch(e => {
    console.error(e.stack);
    process.exit(1);
  });
