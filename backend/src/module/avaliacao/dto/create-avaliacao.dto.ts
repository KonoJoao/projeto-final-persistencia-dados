import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class CreateAvaliacaoDto {
  @ApiProperty({
    description: 'ID do ponto turístico a ser avaliado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  ponto_id: string;

  @ApiProperty({
    description: 'Nota da avaliação (1 a 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  nota: number;

  @ApiProperty({
    description: 'Comentário sobre o ponto turístico',
    example: 'Lugar incrível! Vista maravilhosa da cidade.',
  })
  @IsString()
  @IsNotEmpty()
  comentario: string;
}
