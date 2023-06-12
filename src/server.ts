import { randomUUID } from 'node:crypto';
import fastify from "fastify";
import { knexConnection } from "./databaseConfig";

const server = fastify();

server.get('/', async () => {
    const response = await knexConnection('meals').select('*');

    return response;
})

server.get('/meal', async () => {
    const newMealResponse = await knexConnection('meals').insert({
        id: randomUUID(),
        name: "Hamburguer com refrigerante",
        time: new Date().toString(),
        in_diet: false,
        session_id: randomUUID()
    }).returning('*');

    return newMealResponse;
})

server.listen({ port: 3333 }, () => console.log('Server running'));