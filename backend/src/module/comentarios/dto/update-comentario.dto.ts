import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateComentarioDto } from './create-comentario.dto';

export class UpdateComentarioDto extends PartialType(
  OmitType(CreateComentarioDto, ['pontoId'] as const),
) {}
