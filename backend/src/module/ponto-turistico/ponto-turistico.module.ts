import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PontoTuristicoService } from './ponto-turistico.service';
import { PontoTuristicoController } from './ponto-turistico.controller';
import { PontoTuristico } from '../../config/database/entities/ponto-turistico.entity';
import { AuthModule } from '../../config/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PontoTuristico]), AuthModule],
  controllers: [PontoTuristicoController],
  providers: [PontoTuristicoService],
  exports: [PontoTuristicoService],
})
export class PontoTuristicoModule {}
