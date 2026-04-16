import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  AgentSnapshot,
  CommissionBreakdown,
} from '../transactions/schemas/transaction.schema';

type CommissionAgentInput = {
  agentId: Types.ObjectId | string;
  name: string;
};

@Injectable()
export class CommissionService {
  calculate(
    totalServiceFee: number,
    listingAgent: CommissionAgentInput,
    sellingAgent: CommissionAgentInput,
  ): CommissionBreakdown {
    const agency = totalServiceFee * 0.5;
    const agentPool = totalServiceFee * 0.5;

    const isSameAgent =
      listingAgent.agentId.toString() === sellingAgent.agentId.toString();

    const agents: AgentSnapshot[] = isSameAgent
      ? [
          {
            agentId: new Types.ObjectId(listingAgent.agentId),
            name: listingAgent.name,
            role: 'both',
            amount: agentPool,
          },
        ]
      : [
          {
            agentId: new Types.ObjectId(listingAgent.agentId),
            name: listingAgent.name,
            role: 'listing',
            amount: agentPool / 2,
          },
          {
            agentId: new Types.ObjectId(sellingAgent.agentId),
            name: sellingAgent.name,
            role: 'selling',
            amount: agentPool / 2,
          },
        ];

    return {
      agency,
      agents,
      calculatedAt: new Date(),
      ruleVersion: 'v1',
    };
  }
}
