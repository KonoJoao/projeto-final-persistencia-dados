import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospedagemService } from './hospedagem.service';
import { HospedagemController } from './hospedagem.controller';
import { Hospedagem } from '../../shared/database/entities/hospedagem.entity';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospedagem, PontoTuristico])],
  controllers: [HospedagemController],
  providers: [HospedagemService],
  exports: [HospedagemService],
})
export class HospedagemModule {}
