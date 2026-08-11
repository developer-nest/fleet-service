/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { envs } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { join } from 'path';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      transport: Transport.GRPC,
      options: {
        package: 'fleetService',
        protoPath: join(process.cwd(), 'src/fleet-service.proto'),
        url: `${envs.fleetMicroserviceHost}:${envs.port}`,
        loader: {
          enums: String,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
