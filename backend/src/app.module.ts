import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './module/health/health.module';
import { UserModule } from './module/user/user.module';
import { PontoTuristicoModule } from './module/ponto-turistico/ponto-turistico.module';
import { AvaliacaoModule } from './module/avaliacao/avaliacao.module';
import { FotosModule } from './module/fotos/fotos.module';
import { ComentariosModule } from './module/comentarios/comentarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    DatabaseModule,
    HealthModule,
    UserModule,
    PontoTuristicoModule,
    AvaliacaoModule,
    FotosModule,
    ComentariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
