import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<object> {
    return await this.userService.users();
  }

  @Post()
  async createUser(@Body() data: CreateUserDto): Promise<object> {
    return await this.userService.create(data);
  }

  @Get('/:id')
  async findUser(@Param('id') id: string): Promise<object> {
    return await this.userService.find(Number(id));
  }

  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<object> {
    return await this.userService.update(Number(id), data);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string): Promise<object> {
    return await this.userService.delete(Number(id));
  }
}
