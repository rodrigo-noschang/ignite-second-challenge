import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', table => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('description');
        table.timestamp('time').notNullable().defaultTo(knex.fn.now());
        table.boolean('in_diet').notNullable()
        table.uuid('session_id').notNullable().index();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('meals');
}