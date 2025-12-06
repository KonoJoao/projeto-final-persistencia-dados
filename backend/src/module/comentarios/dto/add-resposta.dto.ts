import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AddRespostaDto {
  @ApiProperty({
    description: 'Texto da resposta',
    example: 'Concordo!',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  texto: string;
}
