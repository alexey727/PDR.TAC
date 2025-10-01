import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, createUserSchema } from '@pdr/shared';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.usersService.findOne(numericId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  @Post()
  async create(@Body() payload: unknown): Promise<User> {
    const parsed = createUserSchema.parse(payload);
    return this.usersService.create(parsed);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: unknown): Promise<User> {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid user id');
    }

    const parsed = createUserSchema.parse(payload);
    const updated = await this.usersService.update(numericId, parsed);
    if (!updated) {
      throw new BadRequestException('User not found');
    }

    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new BadRequestException('Invalid user id');
    }

    const removed = await this.usersService.delete(numericId);
    if (!removed) {
      throw new BadRequestException('User not found');
    }
  }
}
