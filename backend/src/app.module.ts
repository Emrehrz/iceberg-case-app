import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentModule } from './agents/agent.module';
import { CommissionModule } from './commission/commission.module';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { PropertyModule } from './properties/property.module';
import { TransactionModule } from './transactions/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          'mongodb://127.0.0.1:27017/iceberg-case-app',
      }),
    }),
    AgentModule,
    PropertyModule,
    CommissionModule,
    TransactionModule,
    HealthModule,
    ItemsModule,
  ],
})
export class AppModule {}
