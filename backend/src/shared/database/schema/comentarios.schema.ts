import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ComentariosDocument = HydratedDocument<Comentarios>;

export class Resposta {
  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  usuarioNome: string;

  @Prop({ required: true, maxlength: 500 })
  texto: string;

  @Prop({ type: Date, default: Date.now })
  data: Date;
}

@Schema({ timestamps: true })
export class Comentarios {
  @Prop({ required: true })
  pontoId: string;

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  usuarioNome: string;

  @Prop({ required: true, maxlength: 500 })
  texto: string;

  @Prop({ type: [Resposta], default: [] })
  respostas: Resposta[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ComentariosSchema = SchemaFactory.createForClass(Comentarios);
