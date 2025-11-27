import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FotosDocument = HydratedDocument<Fotos>;

@Schema()
export class Fotos {
  @Prop()
  pontoId: string;

  @Prop()
  usuarioId: string;

  @Prop()
  filename: string;

  @Prop()
  titulo: string;

  @Prop()
  path: string;

  @Prop()
  createdAt: Date;
}

export const FotosSchema = SchemaFactory.createForClass(Fotos);
