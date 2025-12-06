import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HospedagemService } from './hospedagem.service';
import { CreateHospedagemDto } from './dto/create-hospedagem.dto';
import { UpdateHospedagemDto } from './dto/update-hospedagem.dto';
import { TipoHospedagem } from '../../shared/database/entities/hospedagem.entity';

@ApiTags('hospedagens')
@Controller('hospedagens')
export class HospedagemController {
  constructor(private readonly hospedagemService: HospedagemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova hospedagem' })
  @ApiResponse({
    status: 201,
    description: 'Hospedagem criada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Ponto turístico não encontrado',
  })
  create(@Body() createHospedagemDto: CreateHospedagemDto) {
    return this.hospedagemService.create(createHospedagemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as hospedagens' })
  @ApiResponse({
    status: 200,
    description: 'Lista de hospedagens com paginação',
  })
  @ApiQuery({
    name: 'pontoId',
    required: false,
    description: 'Filtrar por ID do ponto turístico',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoHospedagem,
    description: 'Filtrar por tipo de hospedagem',
  })
  @ApiQuery({
    name: 'precoMin',
    required: false,
    type: Number,
    description: 'Preço mínimo',
  })
  @ApiQuery({
    name: 'precoMax',
    required: false,
    type: Number,
    description: 'Preço máximo',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página atual',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Tamanho da página',
  })
  findAll(
    @Query('pontoId') pontoId?: string,
    @Query('tipo') tipo?: TipoHospedagem,
    @Query('precoMin') precoMin?: number,
    @Query('precoMax') precoMax?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.hospedagemService.findAll({
      pontoId,
      tipo,
      precoMin,
      precoMax,
      page,
      pageSize,
    });
  }

  @Get('ponto/:pontoId')
  @ApiOperation({ summary: 'Buscar hospedagens por ponto turístico' })
  @ApiParam({
    name: 'pontoId',
    description: 'ID do ponto turístico',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de hospedagens do ponto turístico',
  })
  @ApiResponse({
    status: 404,
    description: 'Ponto turístico não encontrado',
  })
  findByPontoTuristico(@Param('pontoId') pontoId: string) {
    return this.hospedagemService.findByPontoTuristico(pontoId);
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Buscar hospedagens por tipo' })
  @ApiParam({
    name: 'tipo',
    description: 'Tipo de hospedagem',
    enum: TipoHospedagem,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de hospedagens do tipo especificado',
  })
  findByTipo(@Param('tipo') tipo: TipoHospedagem) {
    return this.hospedagemService.findByTipo(tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar hospedagem por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da hospedagem',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospedagem encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospedagem não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.hospedagemService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar hospedagem' })
  @ApiParam({
    name: 'id',
    description: 'ID da hospedagem',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Hospedagem atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospedagem não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateHospedagemDto: UpdateHospedagemDto,
  ) {
    return this.hospedagemService.update(id, updateHospedagemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar hospedagem' })
  @ApiParam({
    name: 'id',
    description: 'ID da hospedagem',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Hospedagem deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Hospedagem não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.hospedagemService.remove(id);
  }
}
