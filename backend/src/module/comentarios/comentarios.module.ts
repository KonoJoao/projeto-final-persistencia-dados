import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import {
  Comentarios,
  ComentariosSchema,
} from '../../shared/database/schema/comentarios.schema';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { Usuario } from 'src/shared/database/entities/usuario.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentarios.name, schema: ComentariosSchema },
    ]),
    TypeOrmModule.forFeature([PontoTuristico, Usuario]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
