const fastify = require('fastify')()
const { initRelay } = require('./src/swarm-relay')


fastify.register(require('fastify-websocket-server')).after((error: Error) => {
    if (error) throw error
    fastify.wss.on('connection', initRelay)
})

fastify.get('/', async () => {
    return { hello: 'world' }
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3400 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()