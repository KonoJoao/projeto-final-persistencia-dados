import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FotosService } from './fotos.service';
import { FotosController } from './fotos.controller';
import { Fotos, FotosSchema } from '../../shared/database/schema/fotos.schema';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { Usuario } from 'src/shared/database/entities/usuario.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fotos.name, schema: FotosSchema }]),
    TypeOrmModule.forFeature([PontoTuristico, Usuario]),
  ],
  controllers: [FotosController],
  providers: [FotosService],
  exports: [FotosService],
})
export class FotosModule {}
