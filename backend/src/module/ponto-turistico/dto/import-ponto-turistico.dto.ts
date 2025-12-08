import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class ImportPontoTuristicoDto {
  @ApiProperty({
    description: 'Nome do ponto turístico',
    example: 'Cristo Redentor',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({
    description: 'Descrição do ponto turístico',
    example: 'Uma das sete maravilhas do mundo moderno',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'Rio de Janeiro',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cidade: string;

  @ApiProperty({
    description: 'Estado',
    example: 'RJ',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  estado: string;

  @ApiProperty({
    description: 'País',
    example: 'Brasil',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pais: string;

  @ApiProperty({
    description: 'Latitude',
    example: -22.951916,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: -43.210487,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Endereço completo',
    example: 'Parque Nacional da Tijuca - Alto da Boa Vista',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  endereco: string;
}

export class ImportResultDto {
  @ApiProperty({
    description: 'Número de registros importados com sucesso',
    example: 10,
  })
  imported: number;

  @ApiProperty({
    description: 'Número de registros ignorados (duplicados)',
    example: 2,
  })
  skipped: number;

  @ApiProperty({
    description: 'Número total de registros processados',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Lista de erros encontrados durante a importação',
    example: [],
  })
  errors: string[] = [];
}
