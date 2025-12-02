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
import { AuthModule } from '../../shared/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentarios.name, schema: ComentariosSchema },
    ]),
    TypeOrmModule.forFeature([PontoTuristico]),
    AuthModule,
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
