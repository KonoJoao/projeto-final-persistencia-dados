import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UploadFotosDto {
  @ApiProperty({
    description: 'ID do ponto turístico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  pontoId: string;

  @ApiProperty({
    description: 'Título da foto (opcional)',
    example: 'Vista panorâmica',
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    description: 'Descrição da foto (opcional)',
    example: 'Vista do topo durante o pôr do sol',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;
}
