import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PontoTuristicoService } from './ponto-turistico.service';
import { PontoTuristicoController } from './ponto-turistico.controller';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { Usuario } from 'src/shared/database/entities/usuario.entity';
import { AuthModule } from 'src/shared/auth/auth.module';
import { PontoTuristicoExportsController } from './ponto-turistico-exports.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([PontoTuristico, Usuario]),
    AuthModule,
    CacheModule.register({ ttl: 10000 }),
  ],
  controllers: [PontoTuristicoController, PontoTuristicoExportsController],
  providers: [PontoTuristicoService],
  exports: [PontoTuristicoService],
})
export class PontoTuristicoModule {}
