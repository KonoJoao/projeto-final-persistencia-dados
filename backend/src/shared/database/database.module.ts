import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Usuario } from './entities/usuario.entity';
import { PontoTuristico } from './entities/ponto-turistico.entity';
import { Hospedagem } from './entities/hospedagem.entity';
import { Avaliacao } from './entities/avaliacao.entity';
import { Fotos, FotosSchema } from './schema/fotos.schema';
import { Comentarios, ComentariosSchema } from './schema/comentarios.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_DATABASE'),
        entities: [Usuario, PontoTuristico, Hospedagem, Avaliacao],
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
        logging: configService.getOrThrow('DB_LOGGING'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGO_URL'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Fotos.name, schema: FotosSchema },
      { name: Comentarios.name, schema: ComentariosSchema },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get('REDIS_HOST') ?? 'localhost',
            port: Number(config.get('REDIS_PORT') ?? 6379),
          },
        }),
        ttl: 60 * 1000,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
