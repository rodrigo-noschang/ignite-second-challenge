import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', table => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('description').nullable();
        table.timestamp('time').defaultTo(knex.fn.now()).notNullable();
        table.boolean('in_diet').notNullable()
        table.uuid('session_id').notNullable().index();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('meals');
}