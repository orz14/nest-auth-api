import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  @HttpCode(200)
  async getAllUsers(): Promise<any> {
    return await this.userService.users();
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() data: CreateUserDto): Promise<any> {
    return await this.userService.create(data);
  }

  @Get('/:id')
  @HttpCode(200)
  async findUser(@Param('id') id: string): Promise<any> {
    return await this.userService.find(id);
  }

  @Patch('/:id')
  @HttpCode(200)
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<any> {
    return await this.userService.update(id, data);
  }

  @Delete('/:id')
  @HttpCode(200)
  async deleteUser(@Param('id') id: string): Promise<any> {
    return await this.userService.delete(id);
  }
}
