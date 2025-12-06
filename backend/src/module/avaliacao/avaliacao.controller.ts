import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { AuthGuard } from '../../shared/auth/auth.guard';

@ApiTags('avaliacoes')
@Controller('avaliacoes')
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova avaliação' })
  @ApiResponse({
    status: 201,
    description: 'Avaliação criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuário já avaliou este ponto turístico',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Ponto turístico não encontrado',
  })
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto, @Request() req) {
    return this.avaliacaoService.create(createAvaliacaoDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de avaliações',
  })
  @ApiQuery({
    name: 'pontoId',
    required: false,
    description: 'Filtrar por ID do ponto turístico',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por ID do usuário',
  })
  findAll(
    @Query('pontoId') pontoId?: string,
    @Query('userId') userId?: string,
  ) {
    if (pontoId) {
      return this.avaliacaoService.findByPontoTuristico(pontoId);
    }
    if (userId) {
      return this.avaliacaoService.findByUser(userId);
    }
    return this.avaliacaoService.findAll();
  }

  @Get('ponto/:pontoId/media')
  @ApiOperation({ summary: 'Obter média de avaliações de um ponto turístico' })
  @ApiParam({
    name: 'pontoId',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Média de avaliações',
    schema: {
      example: {
        pontoId: '550e8400-e29b-41d4-a716-446655440000',
        averageRating: 4.5,
      },
    },
  })
  async getAverageRating(@Param('pontoId') pontoId: string) {
    const averageRating = await this.avaliacaoService.getAverageRating(pontoId);
    return {
      pontoId,
      averageRating,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da avaliação',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Avaliação encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.avaliacaoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiParam({
    name: 'id',
    description: 'ID da avaliação',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Avaliação atualizada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para editar',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
    @Request() req,
  ) {
    return this.avaliacaoService.update(id, updateAvaliacaoDto, req);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar avaliação' })
  @ApiParam({
    name: 'id',
    description: 'ID da avaliação',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Avaliação deletada com sucesso',
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
    description: 'Avaliação não encontrada',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.avaliacaoService.remove(id, req);
  }
}
