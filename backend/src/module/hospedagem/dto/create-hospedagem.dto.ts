import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';
import { TipoHospedagem } from '../../../shared/database/entities/hospedagem.entity';

export class CreateHospedagemDto {
  @ApiProperty({
    description: 'ID do ponto turístico',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  ponto_id: string;

  @ApiProperty({
    description: 'Nome da hospedagem',
    example: 'Hotel Copacabana Palace',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({
    description: 'Endereço da hospedagem',
    example: 'Av. Atlântica, 1702 - Copacabana',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  endereco: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '(21) 2548-7070',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({
    description: 'Preço médio da diária',
    example: 450.0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  preco_medio?: number;

  @ApiProperty({
    description: 'Tipo de hospedagem',
    enum: TipoHospedagem,
    example: TipoHospedagem.HOTEL,
  })
  @IsEnum(TipoHospedagem)
  @IsNotEmpty()
  tipo: TipoHospedagem;

  @ApiProperty({
    description: 'Link para reserva',
    example: 'https://www.booking.com/hotel/br/copacabana-palace',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  link_reserva?: string;
}
