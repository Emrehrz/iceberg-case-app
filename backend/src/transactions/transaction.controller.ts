import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStageDto } from './dto/update-transaction-stage.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto);
  }

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStageDto,
  ) {
    return this.transactionService.updateStage(id, dto);
  }
}
