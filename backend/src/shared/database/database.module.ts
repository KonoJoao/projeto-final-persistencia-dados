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
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { CacheableMemory, Keyv } from 'cacheable';
import KeyvRedis from '@keyv/redis';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'projeto_db'),
        entities: [Usuario, PontoTuristico, Hospedagem, Avaliacao],
        synchronize: configService.get('DB_SYNCHRONIZE', true),
        logging: configService.get('DB_LOGGING', false),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get(
          'MONGO_URI',
          'mongodb://admin:admin@localhost:27017/turismo?authSource=admin',
        ),
      }),
    }),
    MongooseModule.forFeature([
      { name: Fotos.name, schema: FotosSchema },
      { name: Comentarios.name, schema: ComentariosSchema },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST', 'localhost');
        const redisPort = configService.get('REDIS_PORT', '6379');

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(`redis://${redisHost}:${redisPort}`),
          ],
        };
      },
    }),
  ],
  exports: [MongooseModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class DatabaseModule {}
