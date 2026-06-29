/* eslint-disable prettier/prettier */
import * as Joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
}

export const envsSchema = Joi.object({
  PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
}).unknown(true);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
};
