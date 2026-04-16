import { Types } from 'mongoose';
import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  let service: CommissionService;

  beforeEach(() => {
    service = new CommissionService();
  });

  it('same agent scenario: agency 50% and agent pool fully to both role', () => {
    const totalServiceFee = 1000;
    const agentId = new Types.ObjectId();

    const breakdown = service.calculate(
      totalServiceFee,
      { agentId, name: 'Alice' },
      { agentId, name: 'Alice' },
    );

    expect(breakdown.agency).toBe(500);
    expect(breakdown.agents).toHaveLength(1);
    expect(breakdown.agents[0]).toMatchObject({
      agentId: expect.any(Types.ObjectId),
      name: 'Alice',
      role: 'both',
      amount: 500,
    });
    expect(breakdown.ruleVersion).toBe('v1');
    expect(breakdown.calculatedAt).toBeInstanceOf(Date);
  });

  it('different agent scenario: agency 50% and agent pool split equally', () => {
    const totalServiceFee = 800;
    const listingAgentId = new Types.ObjectId();
    const sellingAgentId = new Types.ObjectId();

    const breakdown = service.calculate(
      totalServiceFee,
      { agentId: listingAgentId, name: 'Listing' },
      { agentId: sellingAgentId, name: 'Selling' },
    );

    expect(breakdown.agency).toBe(400);
    expect(breakdown.agents).toHaveLength(2);

    const listingSnapshot = breakdown.agents.find((a) => a.role === 'listing');
    const sellingSnapshot = breakdown.agents.find((a) => a.role === 'selling');

    expect(listingSnapshot).toMatchObject({
      agentId: expect.any(Types.ObjectId),
      name: 'Listing',
      role: 'listing',
      amount: 200,
    });
    expect(sellingSnapshot).toMatchObject({
      agentId: expect.any(Types.ObjectId),
      name: 'Selling',
      role: 'selling',
      amount: 200,
    });

    expect(breakdown.agents[0].amount + breakdown.agents[1].amount).toBe(400);
    expect(breakdown.ruleVersion).toBe('v1');
    expect(breakdown.calculatedAt).toBeInstanceOf(Date);
  });
});

