import { Knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string,
            name: string,
            description: string | null,
            time: string | null,
            in_diet: boolean,
            session_id:string
        }
    }
}