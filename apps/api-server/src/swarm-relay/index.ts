import { FastifyPluginCallback } from "fastify"
const DHT = require('hyperdht')
const { relay } = require('@hyperswarm/dht-relay')
const Stream = require('@hyperswarm/dht-relay/ws')
const dht = new DHT()

const swarmRelay:FastifyPluginCallback = (server, _, done) => {
    server.register(require('fastify-websocket-server')).after((error: Error) => {
        if (error) throw error
        server.wss.on('connection', (ws: WebSocket) => {
            relay(dht, new Stream(false, ws))
        })
    })
    done()
}

module.exports = swarmRelay

