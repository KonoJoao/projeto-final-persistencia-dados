import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const config = new DocumentBuilder()
    .setTitle('API Turismo - Pontos Turísticos')
    .setDescription(
      'API para gerenciamento de pontos turísticos, hospedagens, avaliações, fotos e comentários',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', 'Endpoints de usuários e autenticação')
    .addTag('pontos-turisticos', 'Endpoints relacionados a pontos turísticos')
    .addTag('hospedagens', 'Endpoints relacionados a hospedagens')
    .addTag('avaliacoes', 'Endpoints relacionados a avaliações')
    .addTag('fotos', 'Endpoints relacionados a fotos (MongoDB)')
    .addTag('comentarios', 'Endpoints relacionados a comentários (MongoDB)')
    .addTag('health', 'Endpoints de health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
