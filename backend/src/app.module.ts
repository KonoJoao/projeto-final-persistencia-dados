import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { HealthModule } from './module/health/health.module';
import { UserModule } from './module/user/user.module';
import { PontoTuristicoModule } from './module/ponto-turistico/ponto-turistico.module';
import { AvaliacaoModule } from './module/avaliacao/avaliacao.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    DatabaseModule,
    HealthModule,
    UserModule,
    PontoTuristicoModule,
    AvaliacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
