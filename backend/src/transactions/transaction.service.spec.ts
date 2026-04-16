import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommissionService } from '../commission/commission.service';
import {
  Transaction,
  TRANSACTION_STAGES,
} from './schemas/transaction.schema';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  const transactionId = new Types.ObjectId().toString();
  const propertyId = new Types.ObjectId().toString();
  const listingAgentId = new Types.ObjectId();
  const sellingAgentId = new Types.ObjectId();

  let commissionService: jest.Mocked<CommissionService>;
  let transactionModel: any;
  let agentModel: any;

  function buildService(txStage: string, overrides?: Partial<Transaction>) {
    const tx: any = {
      _id: transactionId,
      stage: txStage,
      propertyId: new Types.ObjectId(propertyId),
      listingAgentId,
      sellingAgentId,
      stageHistory: [],
      totalServiceFee: 1000,
      commissionBreakdown: undefined,
      completedAt: undefined,
      toObject: () => tx,
      ...overrides,
    };

    tx.save = jest.fn().mockResolvedValue(tx);

    transactionModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(tx),
      }),
    };

    const agentById = new Map<string, any>([
      [listingAgentId.toString(), { _id: listingAgentId, name: 'ListingAgent' }],
      [sellingAgentId.toString(), { _id: sellingAgentId, name: 'SellingAgent' }],
    ]);

    agentModel = {
      findById: jest.fn((id: Types.ObjectId) => ({
        exec: jest.fn().mockResolvedValue(agentById.get(id.toString())),
      })),
    };

    commissionService = {
      calculate: jest.fn().mockReturnValue({
        agency: 500,
        agents: [
          {
            agentId: new Types.ObjectId(),
            name: 'ListingAgent',
            role: 'listing',
            amount: 250,
          },
          {
            agentId: new Types.ObjectId(),
            name: 'SellingAgent',
            role: 'selling',
            amount: 250,
          },
        ],
        calculatedAt: new Date('2020-01-01T00:00:00.000Z'),
        ruleVersion: 'v1',
      }),
    } as any;

    const service = new TransactionService(
      transactionModel,
      commissionService,
      agentModel,
    ) as any;

    return { service, tx };
  }

  it('valid transition: agreement -> earnest_money does not trigger commission', async () => {
    const { service, tx } = buildService(TRANSACTION_STAGES[0] as any);

    const updated = await service.updateStage(transactionId, {
      stage: 'earnest_money',
    });

    expect(updated.stage).toBe('earnest_money');
    expect(updated.stageHistory).toHaveLength(1);
    expect(updated.stageHistory[0]).toMatchObject({
      stage: 'earnest_money',
    });
    expect(commissionService.calculate).not.toHaveBeenCalled();
    expect(tx.commissionBreakdown).toBeUndefined();
    expect(tx.completedAt).toBeUndefined();
  });

  it('invalid transition: agreement -> title_deed is rejected', async () => {
    const { service, tx } = buildService('agreement');

    await expect(
      service.updateStage(transactionId, {
        stage: 'title_deed',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(commissionService.calculate).not.toHaveBeenCalled();
    expect(tx.stage).toBe('agreement');
    expect(tx.stageHistory).toHaveLength(0);
    expect(tx.save).not.toHaveBeenCalled();
  });

  it('completed transition: title_deed -> completed triggers commission and persists breakdown', async () => {
    const { service, tx } = buildService('title_deed', {
      commissionBreakdown: undefined,
      completedAt: undefined,
    });

    const updated = await service.updateStage(transactionId, {
      stage: 'completed',
    });

    expect(commissionService.calculate).toHaveBeenCalledTimes(1);
    expect(commissionService.calculate).toHaveBeenCalledWith(1000, {
      agentId: listingAgentId.toString(),
      name: 'ListingAgent',
    }, {
      agentId: sellingAgentId.toString(),
      name: 'SellingAgent',
    });

    expect(updated.stage).toBe('completed');
    expect(updated.commissionBreakdown).toBeDefined();
    expect(updated.completedAt).toBeInstanceOf(Date);
    expect(updated.stageHistory).toHaveLength(1);
    expect(updated.stageHistory[0]).toMatchObject({
      stage: 'completed',
    });
    expect(tx.save).toHaveBeenCalledTimes(1);
  });

  it('completed is immutable: updating after completed is rejected', async () => {
    const { service, tx } = buildService('completed');

    await expect(
      service.updateStage(transactionId, {
        stage: 'completed', // stage change irrelevant; should reject at completed guard
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(commissionService.calculate).not.toHaveBeenCalled();
    expect(agentModel.findById).not.toHaveBeenCalled();
    expect(tx.save).not.toHaveBeenCalled();
  });
});

