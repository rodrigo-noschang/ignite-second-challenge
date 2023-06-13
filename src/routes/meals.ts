import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';

import { knexConnection } from '../databaseConfig';
import { isSessionIdInCookies } from '../middlewares/is-sessionId-in-cookies';
import { calculateBestSequence } from '../utils/calculateBestSequence';

export const mealsRoutes = async (app: FastifyInstance) => {
    app.post('/', async (request, reply) => {
        const newMealBodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            in_diet: z.boolean(),
            time: z.string().optional()
        })

        const mealSchemaParse = newMealBodySchema.safeParse(request.body);
        
        if (!mealSchemaParse.success) {
            throw new Error(mealSchemaParse.error.message);
        }

        const sessionId = request.cookies.sessionId ?? randomUUID();
        reply.cookie('sessionId', sessionId);

        const newMealData = {
            id: randomUUID(),
            session_id: sessionId,
            ...mealSchemaParse.data
        }

        await knexConnection('meals').insert(newMealData)


        return reply.status(201).send();
    })

    app.get('/', async (request) => {
        const { sessionId } = request.cookies

        const meals = await knexConnection('meals')
            .select('*')
            .where('session_id', sessionId)
            .orderBy('time', 'desc');

        return { meals }
    })

    app.get('/:id', 
        {
            preHandler: [isSessionIdInCookies]
        }, 
        async (request, reply) => {
            const { params } = request as any;
            const { sessionId } = request.cookies;

            const meal = await knexConnection('meals')
                .select('*')
                .where({
                    id: params.id,
                    session_id: sessionId
                })
                .first()

            
            if (!meal) {
                reply.status(404).send({
                    message: "Meal not found"
                })
            }
            
            return { meal };
        }
    )

    app.get('/metrics', async (request) => {
        const { sessionId } = request.cookies

        const meals = await knexConnection('meals')
            .select('*')
            .where('session_id', sessionId)
            .orderBy('time', 'desc');

        const total = meals.length;
        const inDietMeals = meals.reduce((acc, curr) => {
            return curr.in_diet ? acc + 1 : acc
        }, 0)
        const offDietMeals = total - inDietMeals;

        const bestSequence = calculateBestSequence(meals);


        return { total, inDietMeals, offDietMeals, bestSequence }
    })

    app.put('/:id', 
        {
            preHandler: [isSessionIdInCookies]
        },
        async (request, reply) => {
            const mealUpdateBodySchema = z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                in_diet: z.boolean().optional(),
                time: z.string().optional()
            })

            const mealSchemaParse = mealUpdateBodySchema.parse(request.body);

            const { sessionId } = request.cookies;
            const { params } = request as any;

            const response = await knexConnection('meals')
                .update(mealSchemaParse)
                .where({
                    session_id: sessionId,
                    id: params.id
                });

            if (!response) {
                return reply.status(404).send({
                    message: "Meal not found"
                })
            }

            return reply.status(204).send();
        }
    )

    app.delete('/:id', 
        {
            preHandler: [isSessionIdInCookies]            
        }, 
        async (request, reply) => {
            const { sessionId } = request.cookies;
            const { params } = request as any;

            const response = await knexConnection('meals')
                .delete()
                .where({
                    id: params.id,
                    session_id: sessionId
                })

            if (response === 0) {
                return reply.status(404).send({
                    message: "Meal not found"
                })
            }

            return reply.status(204).send();
        }
    )
}