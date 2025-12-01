import { PartialType } from '@nestjs/swagger';
import { CreatePontoTuristicoDto } from './create-ponto-turistico.dto';

export class UpdatePontoTuristicoDto extends PartialType(
  CreatePontoTuristicoDto,
) {}
