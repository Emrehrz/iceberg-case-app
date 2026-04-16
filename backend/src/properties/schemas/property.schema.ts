import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Agent } from '../../agents/schemas/agent.schema';

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ versionKey: false })
export class Property {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, type: Types.ObjectId, ref: Agent.name })
  listingAgentId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
