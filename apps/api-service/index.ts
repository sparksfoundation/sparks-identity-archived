const fastify = require('fastify')
const { initRelay } = require('./src/swarm-relay')

const server = fastify()

server.register(require('fastify-websocket-server')).after((error: Error) => {
    if (error) throw error
    server.wss.on('connection', initRelay)
})

server.get('/', async () => {
    return 'hello world\n'
})

server.listen({ port: process.env.PORT || 3400 }, (err: any, address: any) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
