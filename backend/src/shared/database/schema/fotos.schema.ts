import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FotosDocument = HydratedDocument<Fotos>;

@Schema({ timestamps: true })
export class Fotos {
  @Prop({ required: true })
  pontoId: string;

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop()
  titulo: string;

  @Prop()
  descricao: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const FotosSchema = SchemaFactory.createForClass(Fotos);
