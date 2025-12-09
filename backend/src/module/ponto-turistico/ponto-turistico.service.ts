import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PontoTuristico } from '../../shared/database/entities/ponto-turistico.entity';
import { CreatePontoTuristicoDto } from './dto/create-ponto-turistico.dto';
import { UpdatePontoTuristicoDto } from './dto/update-ponto-turistico.dto';
import { AuthService } from 'src/shared/auth';
import { ExportFormat } from './dto/export-format.enum';
import { ImportResultDto } from './dto/import-ponto-turistico.dto';
import { Parser } from 'json2csv';
import * as xml2js from 'xml2js';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PontoTuristicoService {
  URL_CACHE = 'ponto-turistico';

  constructor(
    @InjectRepository(PontoTuristico)
    private pontoTuristicoRepository: Repository<PontoTuristico>,
    @Inject()
    private authService: AuthService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(
    createPontoTuristicoDto: CreatePontoTuristicoDto,
    req: any,
  ): Promise<PontoTuristico> {
    const cacheKey = `${this.URL_CACHE}:create`;
    const user = await this.authService.extractUserFromAuthHeader(req);
    const userId = user.id;

    await this.verificarSeExisteNomeDePontoNaCidade(
      createPontoTuristicoDto.nome,
      createPontoTuristicoDto.cidade,
    );

    const novoPonto = this.pontoTuristicoRepository.create({
      ...createPontoTuristicoDto,
      criado_por: String(userId),
    });

    const result = await this.pontoTuristicoRepository.save(novoPonto);

    // Invalidate all cache entries
    await this.invalidateCache(`${cacheKey}:${result.id}`);

    return result;
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
    nome,
    cidade,
    estado,
    page = 1,
    pageSize = 10,
  }: {
    nome?: string;
    cidade?: string;
    estado?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PontoTuristico[]> {
    // Create cache key based on filters
    const cacheKey = `ponto-turistico:list:${JSON.stringify({ nome, cidade, estado, page, pageSize })}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<PontoTuristico[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // If not in cache, query database
    const result = await this.pontoTuristicoRepository.find({
      relations: ['criador'],
      where: {
        nome,
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

    // Store in cache
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async findOne(id: string): Promise<PontoTuristico> {
    const cacheKey = `${this.URL_CACHE}:${id}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<PontoTuristico>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, query database
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

    await this.cacheManager.set(cacheKey, ponto);

    return ponto;
  }

  async update(
    id: string,
    updatePontoTuristicoDto: UpdatePontoTuristicoDto,
    req: any,
  ): Promise<PontoTuristico> {
    const cacheKey = `${this.URL_CACHE}:${id}`;
    const user = await this.authService.extractUserFromAuthHeader(req);
    const userId = user.id;

    const ponto = await this.findOne(id);

    // Verificar se o usuário é o criador
    if (ponto.criado_por !== String(userId)) {
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
    const result = await this.pontoTuristicoRepository.save(ponto);

    // Invalidate all cache entries
    await this.invalidateCache(cacheKey);

    return result;
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

  async remove(id: string, req: any): Promise<void> {
    const user = await this.authService.extractUserFromAuthHeader(req);
    const userId = user.id;

    const ponto = await this.findOne(id);

    // Verificar se o usuário é o criador
    if (ponto.criado_por !== String(userId)) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este ponto turístico',
      );
    }

    await this.pontoTuristicoRepository.remove(ponto);

    // Invalidate all cache entries
    await this.invalidateCache(`city:${ponto.cidade}`);
  }

  async findByCity(cidade: string): Promise<PontoTuristico[]> {
    const cacheKey = `${this.URL_CACHE}:city:${cidade}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<PontoTuristico[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, query database
    const result = await this.pontoTuristicoRepository.find({
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

    // Store in cache
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async findByState(estado: string): Promise<PontoTuristico[]> {
    const cacheKey = `${this.URL_CACHE}:state:${estado}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<PontoTuristico[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, query database
    const result = await this.pontoTuristicoRepository.find({
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

    // Store in cache
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  // Export/Import Methods

  async exportData(
    format: ExportFormat,
    filters?: {
      nome?: string;
      cidade?: string;
      estado?: string;
    },
  ): Promise<string> {
    // Get all data without pagination for export
    const data = await this.pontoTuristicoRepository.find({
      relations: ['criador'],
      where: filters,
      select: {
        criador: {
          id: true,
          login: true,
          email: true,
        },
      },
    });

    switch (format) {
      case ExportFormat.JSON:
        return this.exportToJson(data);
      case ExportFormat.CSV:
        return this.exportToCsv(data);
      case ExportFormat.XML:
        return this.exportToXml(data);
      default:
        throw new BadRequestException('Formato de exportação inválido');
    }
  }

  private exportToJson(data: PontoTuristico[]): string {
    // Simplify data structure for export
    const exportData = data.map((ponto) => ({
      nome: ponto.nome,
      descricao: ponto.descricao,
      cidade: ponto.cidade,
      estado: ponto.estado,
      pais: ponto.pais,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      endereco: ponto.endereco,
      criado_por: ponto.criador?.login || ponto.criado_por,
      created_at: ponto.created_at,
    }));

    return JSON.stringify(exportData, null, 2);
  }

  private exportToCsv(data: PontoTuristico[]): string {
    const fields = [
      'nome',
      'descricao',
      'cidade',
      'estado',
      'pais',
      'latitude',
      'longitude',
      'endereco',
      'criado_por',
      'created_at',
    ];

    const exportData = data.map((ponto) => ({
      nome: ponto.nome,
      descricao: ponto.descricao,
      cidade: ponto.cidade,
      estado: ponto.estado,
      pais: ponto.pais,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      endereco: ponto.endereco,
      criado_por: ponto.criador?.login || ponto.criado_por,
      created_at: ponto.created_at,
    }));

    const parser = new Parser({ fields });
    return parser.parse(exportData);
  }

  private exportToXml(data: PontoTuristico[]): string {
    const exportData = data.map((ponto) => ({
      nome: ponto.nome,
      descricao: ponto.descricao,
      cidade: ponto.cidade,
      estado: ponto.estado,
      pais: ponto.pais,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      endereco: ponto.endereco,
      criado_por: ponto.criador?.login || ponto.criado_por,
      created_at: ponto.created_at,
    }));

    const builder = new xml2js.Builder({
      rootName: 'pontos_turisticos',
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });

    return builder.buildObject({ ponto_turistico: exportData });
  }

  async importData(
    format: ExportFormat,
    fileContent: string,
    userId: string,
  ): Promise<ImportResultDto> {
    switch (format) {
      case ExportFormat.JSON:
        return await this.importFromJson(fileContent, userId);
      case ExportFormat.CSV:
        return await this.importFromCsv(fileContent, userId);
      case ExportFormat.XML:
        return await this.importFromXml(fileContent, userId);
      default:
        throw new BadRequestException('Formato de importação inválido');
    }
  }

  private async importFromJson(
    content: string,
    userId: string,
  ): Promise<ImportResultDto> {
    const result: ImportResultDto = {
      imported: 0,
      skipped: 0,
      total: 0,
      errors: [],
    };

    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];
      result.total = items.length;

      for (const item of items) {
        try {
          // Check if already exists
          const exists = await this.findByNameAndCity(item.nome, item.cidade);
          if (exists) {
            result.skipped++;
            continue;
          }

          // Create new record
          const novoPonto = this.pontoTuristicoRepository.create({
            nome: item.nome,
            descricao: item.descricao,
            cidade: item.cidade,
            estado: item.estado,
            pais: item.pais,
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            endereco: item.endereco,
            criado_por: userId,
          });

          await this.pontoTuristicoRepository.save(novoPonto);
          result.imported++;
        } catch (error) {
          result.errors.push(`Erro ao importar ${item.nome}: ${error.message}`);
        }
      }
    } catch (error) {
      throw new BadRequestException(`Erro ao processar JSON: ${error.message}`);
    }

    return result;
  }

  private async importFromCsv(
    content: string,
    userId: string,
  ): Promise<ImportResultDto> {
    const result: ImportResultDto = {
      imported: 0,
      skipped: 0,
      total: 0,
      errors: [],
    };

    return new Promise((resolve, reject) => {
      const items: any[] = [];
      const stream = Readable.from([content]);

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          items.push(row);
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on('end', async () => {
          result.total = items.length;

          for (const item of items) {
            try {
              // Check if already exists
              const exists = await this.findByNameAndCity(
                item.nome,
                item.cidade,
              );
              if (exists) {
                result.skipped++;
                continue;
              }

              // Create new record
              const novoPonto = this.pontoTuristicoRepository.create({
                nome: item.nome,
                descricao: item.descricao,
                cidade: item.cidade,
                estado: item.estado,
                pais: item.pais,
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
                endereco: item.endereco,
                criado_por: userId,
              });

              await this.pontoTuristicoRepository.save(novoPonto);
              result.imported++;
            } catch (error) {
              result.errors.push(
                `Erro ao importar ${item.nome}: ${error.message}`,
              );
            }
          }

          resolve(result);
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(`Erro ao processar CSV: ${error.message}`),
          );
        });
    });
  }

  private async importFromXml(
    content: string,
    userId: string,
  ): Promise<ImportResultDto> {
    const result: ImportResultDto = {
      imported: 0,
      skipped: 0,
      total: 0,
      errors: [],
    };

    try {
      const parser = new xml2js.Parser();
      const parsed = await parser.parseStringPromise(content);

      const items = parsed.pontos_turisticos?.ponto_turistico || [];
      result.total = items.length;

      for (const item of items) {
        try {
          // Check if already exists
          const exists = await this.findByNameAndCity(
            item.nome[0],
            item.cidade[0],
          );
          if (exists) {
            result.skipped++;
            continue;
          }

          // Create new record
          const novoPonto = this.pontoTuristicoRepository.create({
            nome: item.nome[0],
            descricao: item.descricao[0],
            cidade: item.cidade[0],
            estado: item.estado[0],
            pais: item.pais[0],
            latitude: parseFloat(item.latitude[0]),
            longitude: parseFloat(item.longitude[0]),
            endereco: item.endereco[0],
            criado_por: userId,
          });

          await this.pontoTuristicoRepository.save(novoPonto);
          result.imported++;
        } catch (error) {
          result.errors.push(
            `Erro ao importar ${item.nome?.[0]}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      throw new BadRequestException(`Erro ao processar XML: ${error.message}`);
    }

    return result;
  }

  private async invalidateCache(key: string): Promise<void> {
    // Invalidate all ponto-turistico cache entries
    await this.cacheManager.del(`${this.URL_CACHE}:${key}`);
  }
}
