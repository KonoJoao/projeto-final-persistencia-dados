import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacaoService } from './avaliacao.service';
import { AvaliacaoController } from './avaliacao.controller';
import { Avaliacao } from '../../shared/database/entities/avaliacao.entity';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { Usuario } from 'src/shared/database/entities/usuario.entity';
import { AuthModule } from 'src/shared/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Avaliacao, PontoTuristico, Usuario]),
    AuthModule,
  ],
  controllers: [AvaliacaoController],
  providers: [AvaliacaoService],
  exports: [AvaliacaoService],
})
export class AvaliacaoModule {}
