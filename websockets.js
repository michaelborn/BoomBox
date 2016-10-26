#!/usr/bin/env node
var socketServer = require("ws").Server,
    wsSettings = { port: 8081 },
    wss = new socketServer(wsSettings);

console.info("WebSocket");
console.info("...... listening on port ", wsSettings.port);

module.exports = wss;
