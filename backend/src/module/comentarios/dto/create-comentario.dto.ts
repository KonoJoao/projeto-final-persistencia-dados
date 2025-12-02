import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';

export class CreateComentarioDto {
  @ApiProperty({
    description: 'ID do ponto turístico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  pontoId: string;

  @ApiProperty({
    description: 'Texto do comentário',
    example: 'Lugar incrível! Recomendo visitar ao pôr do sol.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'O comentário não pode estar vazio' })
  @MaxLength(500, { message: 'O comentário deve ter no máximo 500 caracteres' })
  texto: string;
}
