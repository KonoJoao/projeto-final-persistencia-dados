import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avaliacao } from '../../config/database/entities/avaliacao.entity';
import { PontoTuristico } from '../../config/database/entities/ponto-turistico.entity';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacaoService {
  constructor(
    @InjectRepository(Avaliacao)
    private avaliacaoRepository: Repository<Avaliacao>,
    @InjectRepository(PontoTuristico)
    private pontoTuristicoRepository: Repository<PontoTuristico>,
  ) {}

  async create(
    createAvaliacaoDto: CreateAvaliacaoDto,
    userId: string,
  ): Promise<Avaliacao> {
    // Verificar se o ponto turístico existe
    const ponto = await this.pontoTuristicoRepository.findOne({
      where: { id: createAvaliacaoDto.ponto_id },
    });

    if (!ponto) {
      throw new NotFoundException('Ponto turístico não encontrado');
    }

    // Verificar se o usuário já avaliou este ponto
    const avaliacaoExistente = await this.avaliacaoRepository.findOne({
      where: {
        ponto_id: createAvaliacaoDto.ponto_id,
        usuario_id: userId,
      },
    });

    if (avaliacaoExistente) {
      throw new BadRequestException(
        'Você já avaliou este ponto turístico. Use o método de atualização.',
      );
    }

    const novaAvaliacao = this.avaliacaoRepository.create({
      ...createAvaliacaoDto,
      usuario_id: userId,
    });

    return await this.avaliacaoRepository.save(novaAvaliacao);
  }

  async findAll(): Promise<Avaliacao[]> {
    return await this.avaliacaoRepository.find({
      relations: ['usuario', 'ponto'],
      select: {
        usuario: {
          id: true,
          login: true,
          email: true,
        },
        ponto: {
          id: true,
          nome: true,
          cidade: true,
          estado: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Avaliacao> {
    const avaliacao = await this.avaliacaoRepository.findOne({
      where: { id },
      relations: ['usuario', 'ponto'],
      select: {
        usuario: {
          id: true,
          login: true,
          email: true,
        },
        ponto: {
          id: true,
          nome: true,
          cidade: true,
          estado: true,
        },
      },
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return avaliacao;
  }

  async findByPontoTuristico(pontoId: string): Promise<Avaliacao[]> {
    return await this.avaliacaoRepository.find({
      where: { ponto_id: pontoId },
      relations: ['usuario'],
      select: {
        usuario: {
          id: true,
          login: true,
          email: true,
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByUser(userId: string): Promise<Avaliacao[]> {
    return await this.avaliacaoRepository.find({
      where: { usuario_id: userId },
      relations: ['ponto'],
      select: {
        ponto: {
          id: true,
          nome: true,
          cidade: true,
          estado: true,
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async update(
    id: string,
    updateAvaliacaoDto: UpdateAvaliacaoDto,
    userId: string,
  ): Promise<Avaliacao> {
    const avaliacao = await this.findOne(id);

    // Verificar se o usuário é o autor da avaliação
    if (avaliacao.usuario_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar esta avaliação',
      );
    }

    Object.assign(avaliacao, updateAvaliacaoDto);
    return await this.avaliacaoRepository.save(avaliacao);
  }

  async remove(id: string, userId: string): Promise<void> {
    const avaliacao = await this.findOne(id);

    // Verificar se o usuário é o autor da avaliação
    if (avaliacao.usuario_id !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar esta avaliação',
      );
    }

    await this.avaliacaoRepository.remove(avaliacao);
  }

  async getAverageRating(pontoId: string): Promise<number> {
    const result = await this.avaliacaoRepository
      .createQueryBuilder('avaliacao')
      .select('AVG(avaliacao.nota)', 'average')
      .where('avaliacao.ponto_id = :pontoId', { pontoId })
      .getRawOne();

    return result?.average ? parseFloat(String(result.average)) : 0;
  }
}
