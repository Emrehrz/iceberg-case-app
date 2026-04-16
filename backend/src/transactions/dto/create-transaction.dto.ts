import { Type } from 'class-transformer';
import {
  IsDateString,
  IsMongoId,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class CreateTransactionDto {
  @IsMongoId()
  propertyId: string;

  @IsMongoId()
  listingAgentId: string;

  @IsMongoId()
  sellingAgentId: string;

  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  totalServiceFee: number;

  @IsDateString()
  agreedAt: string;
}

