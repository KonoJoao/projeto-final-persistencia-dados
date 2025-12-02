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
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { AuthGuard } from '../../shared/auth/auth.guard';

@ApiTags('comentarios')
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo comentário' })
  @ApiResponse({
    status: 201,
    description: 'Comentário criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Comentário vazio ou muito longo',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Ponto turístico não encontrado',
  })
  create(
    @Body() createComentarioDto: CreateComentarioDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.comentariosService.create(createComentarioDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os comentários' })
  @ApiResponse({
    status: 200,
    description:
      'Lista de comentários ordenados por data (mais recentes primeiro)',
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
      return this.comentariosService.findByPontoTuristico(pontoId);
    }
    if (userId) {
      return this.comentariosService.findByUser(userId);
    }
    return this.comentariosService.findAll();
  }

  @Get('ponto/:pontoId/count')
  @ApiOperation({ summary: 'Contar comentários de um ponto turístico' })
  @ApiParam({
    name: 'pontoId',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Número de comentários do ponto turístico',
    schema: {
      example: {
        pontoId: '550e8400-e29b-41d4-a716-446655440000',
        count: 15,
      },
    },
  })
  async countByPontoTuristico(@Param('pontoId') pontoId: string) {
    const count = await this.comentariosService.countByPontoTuristico(pontoId);
    return {
      pontoId,
      count,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar comentário por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do comentário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentário encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentário não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.comentariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar comentário' })
  @ApiParam({
    name: 'id',
    description: 'ID do comentário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentário atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Comentário vazio ou muito longo',
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
    description: 'Comentário não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateComentarioDto: UpdateComentarioDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.comentariosService.update(
      id,
      updateComentarioDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar comentário' })
  @ApiParam({
    name: 'id',
    description: 'ID do comentário',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Comentário deletado com sucesso',
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
    description: 'Comentário não encontrado',
  })
  remove(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.comentariosService.remove(id, req.user.sub);
  }
}
