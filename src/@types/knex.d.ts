import { Knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string,
            name: string,
            description: string,
            time: string,
            in_diet: boolean,
            session_id:string
        }
    }
}