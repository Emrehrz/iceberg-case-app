export type TransactionStage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed';

export interface StageHistoryEntry {
  stage: TransactionStage | string;
  changedAt: string;
}

export interface AgentSnapshot {
  agentId: string;
  name: string;
  role: 'listing' | 'selling' | 'both';
  amount: number;
}

export interface CommissionBreakdown {
  agency: number;
  agents: AgentSnapshot[];
  calculatedAt: string;
  ruleVersion: string;
}

export interface Transaction {
  _id: string;
  propertyId: string;
  listingAgentId: string;
  sellingAgentId: string;
  stage: TransactionStage;
  totalServiceFee: number;
  commissionBreakdown?: CommissionBreakdown;
  agreedAt: string;
  completedAt?: string;
  stageHistory: StageHistoryEntry[];
}

export interface CreateTransactionPayload {
  propertyId: string;
  listingAgentId: string;
  sellingAgentId: string;
  totalServiceFee: number;
  /** ISO string expected by backend validation */
  agreedAt: string;
}

export interface UpdateTransactionStagePayload {
  stage: TransactionStage;
}
