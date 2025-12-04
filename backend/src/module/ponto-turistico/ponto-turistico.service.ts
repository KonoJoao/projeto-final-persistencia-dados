import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { CreatePontoTuristicoDto } from './dto/create-ponto-turistico.dto';
import { UpdatePontoTuristicoDto } from './dto/update-ponto-turistico.dto';

@Injectable()
export class PontoTuristicoService {
  constructor(
    @InjectRepository(PontoTuristico)
    private pontoTuristicoRepository: Repository<PontoTuristico>,
  ) {}

  async create(
    createPontoTuristicoDto: CreatePontoTuristicoDto,
    userId: string,
  ): Promise<PontoTuristico> {
    await this.verificarSeExisteNomeDePontoNaCidade(
      createPontoTuristicoDto.nome,
      createPontoTuristicoDto.cidade,
    );

    const novoPonto = this.pontoTuristicoRepository.create({
      ...createPontoTuristicoDto,
      criado_por: userId,
    });

    return await this.pontoTuristicoRepository.save(novoPonto);
  }

  async findByNameAndCity(nome: string, cidade: string, excecao?: string) {
    return await this.pontoTuristicoRepository.findOne({
      where: {
        id: Not(excecao!),
        nome,
        cidade,
      },
    });
  }

  async findAll({
    cidade,
    estado,
    page = 1,
    pageSize = 10,
  }: {
    cidade?: string;
    estado?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PontoTuristico[]> {
    return await this.pontoTuristicoRepository.find({
      relations: ['criador'],
      where: {
        cidade,
        estado,
      },
      select: {
        criador: {
          id: true,
          login: true,
          email: true,
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }

  async findOne(id: string): Promise<PontoTuristico> {
    const ponto = await this.pontoTuristicoRepository.findOne({
      where: { id },
      relations: ['criador', 'avaliacoes', 'hospedagens'],
      select: {
        criador: {
          id: true,
          login: true,
          email: true,
        },
      },
    });

    if (!ponto) {
      throw new NotFoundException('Ponto turístico não encontrado');
    }

    return ponto;
  }

  async update(
    id: string,
    updatePontoTuristicoDto: UpdatePontoTuristicoDto,
    userId: string,
  ): Promise<PontoTuristico> {
    const ponto = await this.findOne(id);

    // Verificar se o usuário é o criador
    if (ponto.criado_por !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este ponto turístico',
      );
    }

    if (updatePontoTuristicoDto.nome)
      await this.verificarSeExisteNomeDePontoNaCidade(
        updatePontoTuristicoDto.nome,
        updatePontoTuristicoDto?.cidade ?? ponto?.cidade,
        id,
      );

    Object.assign(ponto, updatePontoTuristicoDto);
    return await this.pontoTuristicoRepository.save(ponto);
  }

  async verificarSeExisteNomeDePontoNaCidade(
    nome: string,
    cidade: string,
    excecao?: string,
  ) {
    const pontoExistente = await this.findByNameAndCity(nome, cidade, excecao);
    if (pontoExistente) {
      throw new ForbiddenException(
        'Já existe um ponto turístico com esse nome',
      );
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const ponto = await this.findOne(id);

    // Verificar se o usuário é o criador
    if (ponto.criado_por !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este ponto turístico',
      );
    }

    await this.pontoTuristicoRepository.remove(ponto);
  }

  async findByCity(cidade: string): Promise<PontoTuristico[]> {
    return await this.pontoTuristicoRepository.find({
      where: { cidade },
      relations: ['criador'],
      select: {
        criador: {
          id: true,
          login: true,
          email: true,
        },
      },
    });
  }

  async findByState(estado: string): Promise<PontoTuristico[]> {
    return await this.pontoTuristicoRepository.find({
      where: { estado },
      relations: ['criador'],
      select: {
        criador: {
          id: true,
          login: true,
          email: true,
        },
      },
    });
  }
}
