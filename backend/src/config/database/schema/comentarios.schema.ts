import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ComentariosDocument = HydratedDocument<Comentarios>;

class Metadata {
  @Prop()
  language: string;

  @Prop()
  device: string;
}

class Resposta {
  @Prop()
  usuarioId: string;

  @Prop()
  texto: string;

  @Prop()
  data: Date;
}

@Schema()
export class Comentarios {
  @Prop({ required: true })
  pontoId: string;

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  texto: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Metadata })
  metadata: Metadata;

  @Prop({ type: [Resposta], default: [] })
  respostas: Resposta[];
}

export const ComentariosSchema = SchemaFactory.createForClass(Comentarios);
