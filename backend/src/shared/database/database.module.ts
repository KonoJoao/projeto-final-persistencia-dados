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
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

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
    CacheModule.register({
      useFactory: (configService: ConfigService) => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(configService.getOrThrow('REDIS_URL')),
          ],
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
