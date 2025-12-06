import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import {
  Comentarios,
  ComentariosDocument,
} from '../../shared/database/schema/comentarios.schema';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentarios.name)
    private comentariosModel: Model<ComentariosDocument>,
    @InjectRepository(PontoTuristico)
    private pontoTuristicoRepository: Repository<PontoTuristico>,
  ) {}

  async create(
    createComentarioDto: CreateComentarioDto,
    userId: string,
  ): Promise<ComentariosDocument> {
    // Verificar se o ponto turístico existe
    const ponto = await this.pontoTuristicoRepository.findOne({
      where: { id: createComentarioDto.pontoId },
    });

    if (!ponto) {
      throw new NotFoundException('Ponto turístico não encontrado');
    }

    const comentario = new this.comentariosModel({
      ...createComentarioDto,
      usuarioId: userId,
    });

    return await comentario.save();
  }

  async findAll(): Promise<ComentariosDocument[]> {
    return await this.comentariosModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByPontoTuristico(pontoId: string): Promise<ComentariosDocument[]> {
    return await this.comentariosModel
      .find({ pontoId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<ComentariosDocument[]> {
    return await this.comentariosModel
      .find({ usuarioId: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ComentariosDocument> {
    const comentario = await this.comentariosModel.findById(id).exec();

    if (!comentario) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return comentario;
  }

  async update(
    id: string,
    updateComentarioDto: UpdateComentarioDto,
    userId: string,
  ): Promise<ComentariosDocument> {
    const comentario = await this.findOne(id);

    // Verificar se o usuário é o autor do comentário
    if (comentario.usuarioId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este comentário',
      );
    }

    Object.assign(comentario, updateComentarioDto);
    return await comentario.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const comentario = await this.findOne(id);

    // Verificar se o usuário é o autor do comentário
    if (comentario.usuarioId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este comentário',
      );
    }

    await this.comentariosModel.findByIdAndDelete(id).exec();
  }

  async countByPontoTuristico(pontoId: string): Promise<number> {
    return await this.comentariosModel.countDocuments({ pontoId });
  }

  async addResposta(
    comentarioId: string,
    texto: string,
    userId: string,
  ): Promise<ComentariosDocument> {
    const comentario = await this.findOne(comentarioId);

    const novaResposta = {
      usuarioId: userId,
      texto,
      data: new Date(),
    };

    comentario.respostas.push(novaResposta);
    return await comentario.save();
  }
}
