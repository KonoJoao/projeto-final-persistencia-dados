import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FotosService } from './fotos.service';
import { UploadFotosDto } from './dto/upload-fotos.dto';
import { AuthGuard } from '../../shared/auth/auth.guard';

@ApiTags('fotos')
@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('fotos', 10))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload de fotos para um ponto turístico',
    description:
      'Permite upload de até 10 fotos por ponto turístico. Aceita JPEG, PNG e WebP.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pontoId: {
          type: 'string',
          format: 'uuid',
          description: 'ID do ponto turístico',
        },
        titulo: {
          type: 'string',
          description: 'Título da foto (opcional)',
        },
        descricao: {
          type: 'string',
          description: 'Descrição da foto (opcional)',
        },
        fotos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Arquivos de imagem (máximo 10)',
        },
      },
      required: ['pontoId', 'fotos'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Fotos enviadas com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Limite de fotos excedido ou tipo de arquivo inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Ponto turístico não encontrado',
  })
  async uploadFotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadFotosDto: UploadFotosDto,
    @Request() req: { user: { sub: string } },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return await this.fotosService.uploadFotos(
      uploadFotosDto.pontoId,
      req.user.sub,
      files,
      uploadFotosDto.titulo,
      uploadFotosDto.descricao,
    );
  }

  @Get('ponto/:pontoId')
  @ApiOperation({ summary: 'Listar fotos de um ponto turístico' })
  @ApiParam({
    name: 'pontoId',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fotos do ponto turístico',
  })
  async findByPontoTuristico(@Param('pontoId') pontoId: string) {
    return await this.fotosService.findByPontoTuristico(pontoId);
  }

  @Get('ponto/:pontoId/count')
  @ApiOperation({ summary: 'Contar fotos de um ponto turístico' })
  @ApiParam({
    name: 'pontoId',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Número de fotos do ponto turístico',
    schema: {
      example: {
        pontoId: '550e8400-e29b-41d4-a716-446655440000',
        count: 5,
      },
    },
  })
  async countByPontoTuristico(@Param('pontoId') pontoId: string) {
    const count = await this.fotosService.countByPontoTuristico(pontoId);
    return {
      pontoId,
      count,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter metadados de uma foto' })
  @ApiParam({
    name: 'id',
    description: 'ID da foto',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadados da foto',
  })
  @ApiResponse({
    status: 404,
    description: 'Foto não encontrada',
  })
  async findOne(@Param('id') id: string) {
    return await this.fotosService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Baixar arquivo de foto' })
  @ApiParam({
    name: 'id',
    description: 'ID da foto',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo da foto',
  })
  @ApiResponse({
    status: 404,
    description: 'Foto não encontrada',
  })
  async downloadFoto(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimetype } = await this.fotosService.getPhotoFile(id);

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', 'inline');
    res.send(buffer);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar foto' })
  @ApiParam({
    name: 'id',
    description: 'ID da foto',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Foto deletada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para deletar',
  })
  @ApiResponse({
    status: 404,
    description: 'Foto não encontrada',
  })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return await this.fotosService.remove(id, req.user.sub);
  }
}
