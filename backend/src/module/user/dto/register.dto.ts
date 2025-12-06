import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/shared/database/entities/usuario.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'joao_silva',
    description: 'Nome de usuário único',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: UserRole.ADMIN,
    description: 'Role do usuário',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  senha: string;
}
