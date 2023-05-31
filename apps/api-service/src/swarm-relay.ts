const DHT = require('hyperdht')
const { relay } = require('@hyperswarm/dht-relay')
const Stream = require('@hyperswarm/dht-relay/ws')
const dht = new DHT()

module.exports.initRelay = (ws: WebSocket) => {
    relay(dht, new Stream(false, ws))
}