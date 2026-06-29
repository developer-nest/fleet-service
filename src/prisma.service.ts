/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client.js';
import { envs } from './config/envs.js';
import { PrismaPg } from '@prisma/adapter-pg';

// @Injectable()
// export class PrismaService extends PrismaClient {
//   constructor() {
//     const adapter = new PrismaPg({
//       connectionString: envs.databaseUrl,
//     });
//     super({ adapter });
//   }
// }

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: envs.databaseUrl,
      max: 10, // máximo de conexiones en el pool
      idleTimeoutMillis: 30000, //Si una conexión está sin hacer nada durante 30 segundos, se cierra para ahorrar recursos.
      connectionTimeoutMillis: 2000, //Si después de 2 segundos no logras conectar, el sistema lanza un error
    });
    super({ adapter });
  }

  // Buena práctica: cerrar conexiones al apagar el servicio
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
