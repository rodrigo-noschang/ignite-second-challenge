import request from 'supertest';
import { execSync } from 'node:child_process';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { app } from '../src/app';
import { Exclude } from 'class-transformer';

describe('Meals tests', () => {

    beforeAll(async () => {
        await app.ready();
    })

    afterAll(async () => {
        execSync('npm run knex migrate:rollback --all');
        await app.close();
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    })

    it('should be able to create new meal', async () => {
        await request(app.server)
            .post('/meals')
            .send({
                name: 'Hamburguer',
                description: 'Um hamburguer',
                in_diet: false
            })
            .expect(201)
    })

    it('should be able to read all meals', async () => {
        const firstMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Meal 1',
                description: 'First Meal',
                in_diet: false
            })

        const cookies = firstMealResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'Meal 2',
                description: 'Second Meal',
                in_diet: true
            })

        const readMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        expect(readMealsResponse.body.meals).toEqual([
            expect.objectContaining({
                name: 'Meal 1',
                description: 'First Meal'
            }),
            expect.objectContaining({
                name: 'Meal 2',
                description: 'Second Meal',
            })
        ])
    })

    it('shound only be able to read own meals', async () => {
        await request(app.server)
            .post('/meals')
            .send({
                name: 'Meal 1',
                description: 'Meal from user 1',
                in_diet: true
            });

        const secondUserMeal = await request(app.server)
            .post('/meals')
            .send({
                name: 'Meal 2',
                description: 'Meal from user 2',
                in_diet: false
            });

        const secondUserCookies = secondUserMeal.get('Set-Cookie');

        const secondUserMeals = await request(app.server)
            .get('/meals')
            .set('Cookie', secondUserCookies);

        expect(secondUserMeals.body.meals).toEqual([
            expect.objectContaining({
                name: 'Meal 2',
                description: 'Meal from user 2',
            })
        ])

        expect(secondUserMeals.body.meals).not.toContain(
            expect.objectContaining({
                name: 'Meal 1',
                description: 'Meal from user 1',
            })
        )
    })

    it('should be able to update meal', async () => {
        const createdMeal = await request(app.server)
            .post('/meals')
            .send({
                name: 'Original name',
                description: 'Description to the original meal',
                in_diet: false
            })

        const cookies = createdMeal.get('Set-Cookie');

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)

        const mealId = mealsResponse.body.meals[0].id;

        await request(app.server)
            .put(`/meals/${mealId}`)
            .send({
                name: "Updated name",
                description: 'Description to the updated meal',
                in_diet: true
            })
            .set('Cookie', cookies)

        const updatedMealResponse = await request(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', cookies)

        expect(updatedMealResponse.body.meal).toEqual(
            expect.objectContaining({
                name: "Updated name",
                description: 'Description to the updated meal',
            })
        )

        expect(updatedMealResponse.body.meal).not.toEqual(
            expect.objectContaining({
                name: 'Original name',
                description: 'Description to the original meal',
            })
        )
    })

    it('should be able to delete meal', async () => {
        const createdMeal = await request(app.server)
            .post('/meals')
            .send({
                name: 'Original name',
                description: 'Description to the original meal',
                in_diet: false
            })

        const cookies = createdMeal.get('Set-Cookie');

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
        
        expect(mealsResponse.body.meals).toHaveLength(1);

        const mealId = mealsResponse.body.meals[0].id;

        await request(app.server)
            .delete(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .expect(204)

        const deletedMealResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
        
        expect(deletedMealResponse.body.meals).toHaveLength(0);
    })
})