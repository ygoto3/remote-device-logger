#!/usr/bin/env node

const WebSocket = require('ws');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 8080 }
];

const options = commandLineArgs(optionDefinitions);

const wss = new WebSocket.Server({ port: options.port });

wss.on('connection', ws => {
  ws.on('message', message => {
    // eslint-disable-next-line no-console
    console.log('Client says: %s', message);
  });
});

// eslint-disable-next-line no-console
console.log('Log receiver is listen on %d', options.port);
