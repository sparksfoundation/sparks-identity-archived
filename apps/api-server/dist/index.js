"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fastify = require('fastify');
const { initRelay } = require('./src/swarm-relay');
const server = fastify();
server.register(require('fastify-websocket-server')).after((error) => {
    if (error)
        throw error;
    server.wss.on('connection', initRelay);
});
server.get('/', () => __awaiter(void 0, void 0, void 0, function* () {
    return 'hello world\n';
}));
server.listen({ port: process.env.PORT || 3400 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
