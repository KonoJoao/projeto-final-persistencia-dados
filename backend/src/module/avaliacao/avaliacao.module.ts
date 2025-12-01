import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacaoService } from './avaliacao.service';
import { AvaliacaoController } from './avaliacao.controller';
import { Avaliacao } from '../../config/database/entities/avaliacao.entity';
import { PontoTuristico } from '../../config/database/entities/ponto-turistico.entity';
import { AuthModule } from '../../config/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Avaliacao, PontoTuristico]), AuthModule],
  controllers: [AvaliacaoController],
  providers: [AvaliacaoService],
  exports: [AvaliacaoService],
})
export class AvaliacaoModule {}
