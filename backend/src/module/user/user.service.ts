import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../shared/database/entities/usuario.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from 'src/shared/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private authService: AuthService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const { login, email, senha } = registerDto;

    // Verificar se usuário já existe
    const existingUser = await this.usuarioRepository.findOne({
      where: [{ email }, { login }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email já está em uso');
      }
      if (existingUser.login === login) {
        throw new ConflictException('Login já está em uso');
      }
    }

    // Hash da senha
    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    // Criar novo usuário
    const novoUsuario = this.usuarioRepository.create({
      login,
      email,
      senha_hash,
    });

    const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);

    // Gerar token JWT
    return this.generateToken(usuarioSalvo);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { identifier, senha } = loginDto;

    // Buscar usuário por email ou login
    const usuario = await this.usuarioRepository.findOne({
      where: [{ email: identifier }, { login: identifier }],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    return this.generateToken(usuario);
  }

  private async generateToken(
    usuario: Usuario,
  ): Promise<{ access_token: string }> {
    return await this.authService.signIn(usuario.id, usuario.login);
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      select: ['id', 'login', 'email', 'role', 'created_at'],
    });
  }
}
