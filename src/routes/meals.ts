import { z } from 'zod';
import { FastifyInstance } from 'fastify';

import { knexConnection } from '../databaseConfig';
import { randomUUID } from 'node:crypto';

export const mealsRoutes = async (app: FastifyInstance) => {

    app.post('/', async (request, reply) => {
        const sessionId = request.cookies.sessionId ?? randomUUID();
        
        const newMealBodySchema = z.object({
            name: z.string(),
            description: z.string().nullable().default(null),
            in_diet: z.boolean()
        })

        const mealSchemaParse = newMealBodySchema.safeParse(request.body);
        
        if (!mealSchemaParse.success) {
            throw new Error(mealSchemaParse.error.message);
        }

        reply.cookie('sessionId', sessionId);

        const newMealData = {
            id: randomUUID(),
            session_id: sessionId,
            ...mealSchemaParse.data
        }

        await knexConnection('meals').insert(newMealData)


        return reply.send(201);
    })
}