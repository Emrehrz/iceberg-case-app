import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommissionService } from '../commission/commission.service';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionStage,
  TRANSACTION_STAGES,
} from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStageDto } from './dto/update-transaction-stage.dto';

@Injectable()
export class TransactionService {
  private readonly allowedTransition: Record<
    TransactionStage,
    TransactionStage | null
  > = {
    agreement: 'earnest_money',
    earnest_money: 'title_deed',
    title_deed: 'completed',
    completed: null,
  };

  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly commissionService: CommissionService,
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const agreedAt = new Date(dto.agreedAt);

    const created = await this.transactionModel.create({
      propertyId: new Types.ObjectId(dto.propertyId),
      listingAgentId: new Types.ObjectId(dto.listingAgentId),
      sellingAgentId: new Types.ObjectId(dto.sellingAgentId),
      stage: TRANSACTION_STAGES[0],
      totalServiceFee: dto.totalServiceFee,
      commissionBreakdown: undefined,
      agreedAt,
      completedAt: undefined,
      stageHistory: [{ stage: TRANSACTION_STAGES[0], changedAt: agreedAt }],
    });

    return created.toObject();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find().sort({ agreedAt: -1 }).lean();
  }

  async findOne(id: string): Promise<Transaction> {
    const tx = await this.transactionModel.findById(id).lean();
    if (!tx) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return tx;
  }

  async updateStage(
    id: string,
    dto: UpdateTransactionStageDto,
  ): Promise<Transaction> {
    const tx = await this.transactionModel.findById(id).exec();
    if (!tx) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    if (tx.stage === 'completed') {
      throw new BadRequestException('Transaction is completed');
    }

    const currentStage = tx.stage;
    const nextStage = dto.stage;
    const allowedNext = this.allowedTransition[currentStage];

    if (allowedNext !== nextStage) {
      throw new BadRequestException(
        `Invalid stage transition from ${currentStage} to ${nextStage}`,
      );
    }

    tx.stage = nextStage;
    tx.stageHistory = tx.stageHistory ?? [];
    tx.stageHistory.push({ stage: nextStage, changedAt: new Date() });

    if (nextStage === 'completed') {
      const [listingAgent, sellingAgent] = await Promise.all([
        this.agentModel.findById(tx.listingAgentId).exec(),
        this.agentModel.findById(tx.sellingAgentId).exec(),
      ]);

      if (!listingAgent) {
        throw new NotFoundException(
          `Listing agent ${tx.listingAgentId.toString()} not found`,
        );
      }
      if (!sellingAgent) {
        throw new NotFoundException(
          `Selling agent ${tx.sellingAgentId.toString()} not found`,
        );
      }

      // CommissionService yalnızca matematiği/snapshot üretimini yapar.
      const commissionBreakdown = this.commissionService.calculate(
        tx.totalServiceFee,
        { agentId: tx.listingAgentId.toString(), name: listingAgent.name },
        { agentId: tx.sellingAgentId.toString(), name: sellingAgent.name },
      );

      tx.commissionBreakdown = commissionBreakdown;
      tx.completedAt = new Date();
    } else {
      // completed dışındaki durumlarda commissionBreakdown sabit kalır.
      // (State machine gereği completed'a geçiş yapılmadan commission hesaplanmaz.)
      if (typeof tx.commissionBreakdown !== 'undefined') {
        // Güvenlik: completed'a geçmeden commission oluştuysa temizlemiyoruz.
        // Prompt gereği completion sonrası değişim zaten reddedilecek.
      }
    }

    await tx.save();
    return tx.toObject();
  }
}
