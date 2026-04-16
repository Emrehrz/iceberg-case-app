import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ versionKey: false })
export class Agent {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
