import z from 'zod';
import { config } from 'dotenv';

config();

const environmentVariablesSchema = z.object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
})

const parsedSchema = environmentVariablesSchema.safeParse(process.env);

if (!parsedSchema.success) {
    throw new Error('Error on enviroment variables, please check .env.example files');
};

export const env = parsedSchema.data;