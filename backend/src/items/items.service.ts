import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, ItemDocument } from './schemas/item.schema';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const createdItem = await this.itemModel.create({
      ...createItemDto,
      description: createItemDto.description ?? '',
    });
    return createdItem.toObject();
  }

  async findAll(): Promise<Item[]> {
    return this.itemModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemModel.findById(id).lean();
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const updatedItem = await this.itemModel
      .findByIdAndUpdate(id, updateItemDto, { new: true, runValidators: true })
      .lean();
    if (!updatedItem) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return updatedItem;
  }

  async remove(id: string): Promise<void> {
    const deletedItem = await this.itemModel.findByIdAndDelete(id).lean();
    if (!deletedItem) {
      throw new NotFoundException(`Item ${id} not found`);
    }
  }
}
