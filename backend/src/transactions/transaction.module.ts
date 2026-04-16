import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentModule } from '../agents/agent.module';
import { CommissionModule } from '../commission/commission.module';
import { PropertyModule } from '../properties/property.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    AgentModule,
    PropertyModule,
    CommissionModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [MongooseModule, TransactionService],
})
export class TransactionModule {}
