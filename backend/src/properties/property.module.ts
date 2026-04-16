import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentModule } from '../agents/agent.module';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { Property, PropertySchema } from './schemas/property.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
    AgentModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [MongooseModule, PropertyService],
})
export class PropertyModule {}
