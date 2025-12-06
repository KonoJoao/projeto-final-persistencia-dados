import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PontoTuristicoService } from './ponto-turistico.service';
import { PontoTuristicoController } from './ponto-turistico.controller';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { Usuario } from 'src/shared/database/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PontoTuristico, Usuario])],
  controllers: [PontoTuristicoController],
  providers: [PontoTuristicoService],
  exports: [PontoTuristicoService],
})
export class PontoTuristicoModule {}
