import knex, { Knex } from 'knex';

import { env } from './env';

const databaseURL = env.DATABASE_CLIENT === 'pg' ? env.DATABASE_URL :
    {
        filename: env.DATABASE_URL
    }

export const knexConfig: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection: databaseURL,
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    }
}

export const knexConnection = knex(knexConfig);