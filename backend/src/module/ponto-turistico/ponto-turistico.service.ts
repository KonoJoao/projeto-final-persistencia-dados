import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PontoTuristico } from '../../config/database/entities/ponto-turistico.entity';
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
    const novoPonto = this.pontoTuristicoRepository.create({
      ...createPontoTuristicoDto,
      criado_por: userId,
    });

    return await this.pontoTuristicoRepository.save(novoPonto);
  }

  async findAll(): Promise<PontoTuristico[]> {
    return await this.pontoTuristicoRepository.find({
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

    Object.assign(ponto, updatePontoTuristicoDto);
    return await this.pontoTuristicoRepository.save(ponto);
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
