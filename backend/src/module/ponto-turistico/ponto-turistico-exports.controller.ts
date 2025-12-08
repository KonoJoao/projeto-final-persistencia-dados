import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PontoTuristicoService } from './ponto-turistico.service';
import { ExportFormat } from './dto/export-format.enum';
import { UserRole } from '../../shared/database/entities/usuario.entity';
import { AuthGuard, Roles } from 'src/shared/auth';
import { ImportResultDto } from './dto/import-ponto-turistico.dto';

@ApiTags('pontos-turisticos-exports')
@Controller('pontos-turisticos-exports')
export class PontoTuristicoExportsController {
  constructor(private readonly pontoTuristicoService: PontoTuristicoService) {}

  @Get('export')
  @ApiOperation({ summary: 'Exportar pontos turísticos' })
  @ApiQuery({
    name: 'format',
    enum: ExportFormat,
    description: 'Formato de exportação (json, csv, xml)',
    required: true,
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    description: 'Filtrar por nome',
  })
  @ApiQuery({
    name: 'cidade',
    required: false,
    description: 'Filtrar por cidade',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados exportados com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato inválido',
  })
  async export(
    @Query('format') format: ExportFormat,
    @Res() res: Response,
    @Query('nome') nome?: string,
    @Query('cidade') cidade?: string,
    @Query('estado') estado?: string,
  ) {
    if (!Object.values(ExportFormat).includes(format)) {
      throw new BadRequestException('Formato inválido. Use: json, csv ou xml');
    }

    try {
      const data = await this.pontoTuristicoService.exportData(format, {
        nome,
        cidade,
        estado,
      });

      // Set appropriate content type and filename
      const contentTypes = {
        [ExportFormat.JSON]: 'application/json',
        [ExportFormat.CSV]: 'text/csv',
        [ExportFormat.XML]: 'application/xml',
      };

      const extensions = {
        [ExportFormat.JSON]: 'json',
        [ExportFormat.CSV]: 'csv',
        [ExportFormat.XML]: 'xml',
      };

      res.setHeader('Content-Type', contentTypes[format]);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=pontos-turisticos.${extensions[format]}`,
      );
      res.send(data);
    } catch (e) {
      console.error(e);
    }
  }

  @Post('import')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar pontos turísticos de arquivo' })
  @ApiQuery({
    name: 'format',
    enum: ExportFormat,
    description: 'Formato do arquivo (json, csv, xml)',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Dados importados com sucesso',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Formato inválido ou erro no arquivo',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Query('format') format: ExportFormat,
    @Request() req,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (!Object.values(ExportFormat).includes(format)) {
      throw new BadRequestException('Formato inválido. Use: json, csv ou xml');
    }

    const user =
      await this.pontoTuristicoService['authService'].extractUserFromAuthHeader(
        req,
      );
    const userId = String(user.id);

    const fileContent = file.buffer.toString('utf-8');
    return await this.pontoTuristicoService.importData(
      format,
      fileContent,
      userId,
    );
  }
}
