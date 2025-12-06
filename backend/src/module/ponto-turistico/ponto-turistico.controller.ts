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
import { PontoTuristicoService } from './ponto-turistico.service';
import { CreatePontoTuristicoDto } from './dto/create-ponto-turistico.dto';
import { UpdatePontoTuristicoDto } from './dto/update-ponto-turistico.dto';
import { AuthGuard } from '../../shared/auth/auth.guard';

@ApiTags('pontos-turisticos')
@Controller('pontos-turisticos')
export class PontoTuristicoController {
  constructor(private readonly pontoTuristicoService: PontoTuristicoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo ponto turístico' })
  @ApiResponse({
    status: 201,
    description: 'Ponto turístico criado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  create(
    @Body() createPontoTuristicoDto: CreatePontoTuristicoDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.pontoTuristicoService.create(
      createPontoTuristicoDto,
      req.user.sub,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pontos turísticos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pontos turísticos',
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página atual',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    description: 'Filtrar por nome',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Tamanho da página',
  })
  findAll(
    @Query('nome') nome?: string,
    @Query('cidade') cidade?: string,
    @Query('estado') estado?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.pontoTuristicoService.findAll({
      nome,
      cidade,
      estado,
      page,
      pageSize,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ponto turístico por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Ponto turístico encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Ponto turístico não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.pontoTuristicoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar ponto turístico' })
  @ApiParam({
    name: 'id',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Ponto turístico atualizado com sucesso',
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
    description: 'Ponto turístico não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updatePontoTuristicoDto: UpdatePontoTuristicoDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.pontoTuristicoService.update(
      id,
      updatePontoTuristicoDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar ponto turístico' })
  @ApiParam({
    name: 'id',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Ponto turístico deletado com sucesso',
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
    description: 'Ponto turístico não encontrado',
  })
  remove(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.pontoTuristicoService.remove(id, req.user.sub);
  }
}
