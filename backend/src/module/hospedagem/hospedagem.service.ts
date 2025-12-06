import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Hospedagem,
  TipoHospedagem,
} from '../../shared/database/entities/hospedagem.entity';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { CreateHospedagemDto } from './dto/create-hospedagem.dto';
import { UpdateHospedagemDto } from './dto/update-hospedagem.dto';

@Injectable()
export class HospedagemService {
  constructor(
    @InjectRepository(Hospedagem)
    private hospedagemRepository: Repository<Hospedagem>,
    @InjectRepository(PontoTuristico)
    private pontoTuristicoRepository: Repository<PontoTuristico>,
  ) {}

  async create(createHospedagemDto: CreateHospedagemDto): Promise<Hospedagem> {
    // Verificar se o ponto turístico existe
    const pontoTuristico = await this.pontoTuristicoRepository.findOne({
      where: { id: createHospedagemDto.ponto_id },
    });

    if (!pontoTuristico) {
      throw new NotFoundException('Ponto turístico não encontrado');
    }

    const novaHospedagem =
      this.hospedagemRepository.create(createHospedagemDto);
    return await this.hospedagemRepository.save(novaHospedagem);
  }

  async findAll({
    pontoId,
    tipo,
    precoMin,
    precoMax,
    page = 1,
    pageSize = 10,
  }: {
    pontoId?: string;
    tipo?: TipoHospedagem;
    precoMin?: number;
    precoMax?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: Hospedagem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const where: any = {};

    if (pontoId) {
      where.ponto_id = pontoId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    // Filtro de preço
    if (precoMin !== undefined && precoMax !== undefined) {
      where.preco_medio = Between(precoMin, precoMax);
    } else if (precoMin !== undefined) {
      where.preco_medio = MoreThanOrEqual(precoMin);
    } else if (precoMax !== undefined) {
      where.preco_medio = LessThanOrEqual(precoMax);
    }

    const [data, total] = await this.hospedagemRepository.findAndCount({
      where,
      relations: ['ponto'],
      take: pageSize,
      skip: (page - 1) * pageSize,
      order: {
        nome: 'ASC',
      },
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<Hospedagem> {
    const hospedagem = await this.hospedagemRepository.findOne({
      where: { id },
      relations: ['ponto'],
    });

    if (!hospedagem) {
      throw new NotFoundException('Hospedagem não encontrada');
    }

    return hospedagem;
  }

  async findByPontoTuristico(pontoId: string): Promise<Hospedagem[]> {
    // Verificar se o ponto turístico existe
    const pontoTuristico = await this.pontoTuristicoRepository.findOne({
      where: { id: pontoId },
    });

    if (!pontoTuristico) {
      throw new NotFoundException('Ponto turístico não encontrado');
    }

    return await this.hospedagemRepository.find({
      where: { ponto_id: pontoId },
      relations: ['ponto'],
      order: {
        preco_medio: 'ASC',
      },
    });
  }

  async findByTipo(tipo: TipoHospedagem): Promise<Hospedagem[]> {
    return await this.hospedagemRepository.find({
      where: { tipo },
      relations: ['ponto'],
      order: {
        nome: 'ASC',
      },
    });
  }

  async update(
    id: string,
    updateHospedagemDto: UpdateHospedagemDto,
  ): Promise<Hospedagem> {
    const hospedagem = await this.findOne(id);

    // Se estiver atualizando o ponto_id, verificar se existe
    if (updateHospedagemDto.ponto_id) {
      const pontoTuristico = await this.pontoTuristicoRepository.findOne({
        where: { id: updateHospedagemDto.ponto_id },
      });

      if (!pontoTuristico) {
        throw new NotFoundException('Ponto turístico não encontrado');
      }
    }

    Object.assign(hospedagem, updateHospedagemDto);
    return await this.hospedagemRepository.save(hospedagem);
  }

  async remove(id: string): Promise<void> {
    const hospedagem = await this.findOne(id);
    await this.hospedagemRepository.remove(hospedagem);
  }
}
