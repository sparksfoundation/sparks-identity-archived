"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DHT = require('hyperdht');
const { relay } = require('@hyperswarm/dht-relay');
const Stream = require('@hyperswarm/dht-relay/ws');
const dht = new DHT();
module.exports.initRelay = (ws) => {
    relay(dht, new Stream(false, ws));
};
const swarmRelay = (server, _, done) => {
    server.register(require('fastify-websocket-server')).after((error) => {
        if (error)
            throw error;
        server.wss.on('connection', initRelay);
    });
};
module.exports = swarmRelay;
