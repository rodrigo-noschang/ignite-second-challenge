import z from 'zod';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'test') {
    config({
        path: '.env.test'
    })
} else {
    config()
}

const environmentVariablesSchema = z.object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_CLIENT: z.enum(['sqlite3', 'pg']),
    DATABASE_URL: z.string()
})

const parsedSchema = environmentVariablesSchema.safeParse(process.env);

if (!parsedSchema.success) {
    throw new Error('Error on enviroment variables, please check .env.example files');
};

export const env = parsedSchema.data;