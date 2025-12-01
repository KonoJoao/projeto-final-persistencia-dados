import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreatePontoTuristicoDto {
  @ApiProperty({
    description: 'Nome do ponto turístico',
    example: 'Cristo Redentor',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({
    description: 'Descrição detalhada do ponto turístico',
    example: 'Uma das Sete Maravilhas do Mundo Moderno',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Cidade onde está localizado',
    example: 'Rio de Janeiro',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cidade: string;

  @ApiProperty({
    description: 'Estado onde está localizado',
    example: 'Rio de Janeiro',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  estado: string;

  @ApiProperty({
    description: 'País onde está localizado',
    example: 'Brasil',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pais: string;

  @ApiProperty({
    description: 'Latitude do ponto turístico',
    example: -22.951916,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude do ponto turístico',
    example: -43.210487,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Endereço completo',
    example: 'Parque Nacional da Tijuca - Alto da Boa Vista',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  endereco: string;
}
