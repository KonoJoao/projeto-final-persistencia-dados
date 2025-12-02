import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import {
  Fotos,
  FotosDocument,
} from '../../shared/database/schema/fotos.schema';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FotosService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'fotos');
  private readonly maxFotosPorPonto = 10;

  constructor(
    @InjectModel(Fotos.name) private fotosModel: Model<FotosDocument>,
    @InjectRepository(PontoTuristico)
    private pontoTuristicoRepository: Repository<PontoTuristico>,
  ) {
    void this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFotos(
    pontoId: string,
    userId: string,
    files: Express.Multer.File[],
    titulo?: string,
    descricao?: string,
  ): Promise<FotosDocument[]> {
    // Verificar se o ponto turístico existe
    const ponto = await this.pontoTuristicoRepository.findOne({
      where: { id: pontoId },
    });

    if (!ponto) {
      throw new NotFoundException('Ponto turístico não encontrado');
    }

    // Verificar quantas fotos o ponto já tem
    const fotosExistentes = await this.fotosModel.countDocuments({ pontoId });

    if (fotosExistentes + files.length > this.maxFotosPorPonto) {
      throw new BadRequestException(
        `Este ponto turístico já atingiu o limite de ${this.maxFotosPorPonto} fotos. Atualmente possui ${fotosExistentes} foto(s).`,
      );
    }

    // Validar tipos de arquivo
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Tipo de arquivo não permitido: ${file.mimetype}. Apenas JPEG, PNG e WebP são aceitos.`,
        );
      }
    }

    const savedFotos: FotosDocument[] = [];

    for (const file of files) {
      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);

      // Salvar arquivo no sistema de arquivos
      await fs.writeFile(filePath, Buffer.from(file.buffer));

      // Salvar metadados no MongoDB
      const foto = new this.fotosModel({
        pontoId,
        usuarioId: userId,
        filename: uniqueFilename,
        originalName: file.originalname,
        titulo: titulo || file.originalname,
        descricao,
        path: filePath,
        mimetype: file.mimetype,
        size: file.size,
      });

      const savedFoto = await foto.save();
      savedFotos.push(savedFoto);
    }

    return savedFotos;
  }

  async findByPontoTuristico(pontoId: string): Promise<FotosDocument[]> {
    return await this.fotosModel
      .find({ pontoId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<FotosDocument> {
    const foto = await this.fotosModel.findById(id).exec();

    if (!foto) {
      throw new NotFoundException('Foto não encontrada');
    }

    return foto;
  }

  async remove(id: string, userId: string): Promise<void> {
    const foto = await this.findOne(id);

    // Verificar se o usuário é o dono da foto
    if (foto.usuarioId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar esta foto',
      );
    }

    // Deletar arquivo do sistema de arquivos
    try {
      await fs.unlink(foto.path);
    } catch {
      console.error('Erro ao deletar arquivo do sistema de arquivos');
      // Continua mesmo se o arquivo não existir
    }

    // Deletar registro do MongoDB
    await this.fotosModel.findByIdAndDelete(id).exec();
  }

  async getPhotoFile(
    id: string,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const foto = await this.findOne(id);

    try {
      const buffer = await fs.readFile(foto.path);
      return {
        buffer,
        mimetype: foto.mimetype,
      };
    } catch {
      throw new NotFoundException('Arquivo de foto não encontrado no sistema');
    }
  }

  async countByPontoTuristico(pontoId: string): Promise<number> {
    return await this.fotosModel.countDocuments({ pontoId });
  }
}
