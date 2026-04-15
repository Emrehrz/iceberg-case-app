import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ItemDocument = HydratedDocument<Item>;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: false })
  isDone: boolean;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
