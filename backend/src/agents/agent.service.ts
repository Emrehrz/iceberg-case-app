import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
  ) {}

  async findAll(): Promise<Agent[]> {
    return this.agentModel.find().sort({ createdAt: -1 }).lean();
  }
}
