import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Agent } from '../../agents/schemas/agent.schema';
import { Property } from '../../properties/schemas/property.schema';

export const TRANSACTION_STAGES = [
  'agreement',
  'earnest_money',
  'title_deed',
  'completed',
] as const;

export type TransactionStage = (typeof TRANSACTION_STAGES)[number];

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ _id: false, versionKey: false })
export class AgentSnapshot {
  @Prop({ required: true, type: Types.ObjectId })
  agentId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['listing', 'selling', 'both'] })
  role: 'listing' | 'selling' | 'both';

  @Prop({ required: true })
  amount: number;
}

export const AgentSnapshotSchema = SchemaFactory.createForClass(AgentSnapshot);

@Schema({ _id: false, versionKey: false })
export class CommissionBreakdown {
  @Prop({ required: true })
  agency: number;

  @Prop({ required: true, type: [AgentSnapshotSchema] })
  agents: AgentSnapshot[];

  @Prop({ required: true })
  calculatedAt: Date;

  @Prop({ required: true, trim: true })
  ruleVersion: string;
}

export const CommissionBreakdownSchema =
  SchemaFactory.createForClass(CommissionBreakdown);

@Schema({ _id: false, versionKey: false })
export class StageHistoryEntry {
  @Prop({ required: true, trim: true })
  stage: string;

  @Prop({ required: true })
  changedAt: Date;
}

export const StageHistoryEntrySchema =
  SchemaFactory.createForClass(StageHistoryEntry);

@Schema({ versionKey: false })
export class Transaction {
  @Prop({ required: true, type: Types.ObjectId, ref: Property.name })
  propertyId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Agent.name })
  listingAgentId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Agent.name })
  sellingAgentId: Types.ObjectId;

  @Prop({ required: true, enum: TRANSACTION_STAGES })
  stage: TransactionStage;

  @Prop({ required: true })
  totalServiceFee: number;

  @Prop({ required: false, type: CommissionBreakdownSchema })
  commissionBreakdown?: CommissionBreakdown;

  @Prop({ required: true })
  agreedAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ required: true, type: [StageHistoryEntrySchema], default: [] })
  stageHistory: StageHistoryEntry[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
