import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './decorators/user.decorator';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('/register')
  @HttpCode(201)
  async authRegister(@Body() data: CreateUserDto): Promise<any> {
    return await this.userService.create(data);
  }

  @Post('/login')
  @HttpCode(200)
  async authLogin(@Body() data: LoginDto): Promise<any> {
    return await this.authService.login(data);
  }

  @UseGuards(AuthGuard('jwt'))
  // @Serialize(UserDto)
  @Get('/me')
  @HttpCode(200)
  currentUser(@User() user: object): any {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/refresh-token')
  @HttpCode(201)
  async refreshToken(
    @User() user: { id: string; name: string; email: string },
  ): Promise<any> {
    return await this.authService.refreshToken(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(200)
  async authLogout(@User() user: { id: string }): Promise<any> {
    return await this.authService.logout(user.id);
  }
}
