import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAvaliacaoDto } from './create-avaliacao.dto';

export class UpdateAvaliacaoDto extends PartialType(
  OmitType(CreateAvaliacaoDto, ['ponto_id'] as const),
) {}
