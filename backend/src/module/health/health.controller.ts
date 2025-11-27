import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get('mongo')
  checkMongoConnection() {
    const isConnected =
      this.mongoConnection.readyState == ConnectionStates.connected;
    return {
      status: isConnected ? 'connected' : 'disconnected',
      readyState: this.mongoConnection.readyState,
      host: this.mongoConnection.host,
      name: this.mongoConnection.name,
      message: isConnected
        ? 'MongoDB está conectado com sucesso!'
        : 'MongoDB não está conectado',
    };
  }

  @Get('all')
  checkAllConnections() {
    const mongoConnected =
      this.mongoConnection.readyState == ConnectionStates.connected;

    return {
      mongodb: {
        status: mongoConnected ? 'connected' : 'disconnected',
        readyState: this.mongoConnection.readyState,
        database: this.mongoConnection.name,
      },
      message: 'Health check completo',
    };
  }
}
