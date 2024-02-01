import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { UserService } from 'src/user/user.service';
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
  async authRegister(@Body() data: CreateUserDto): Promise<object> {
    return await this.userService.create(data);
  }

  @Post('/login')
  async authLogin(@Body() data: LoginDto): Promise<object> {
    return await this.authService.login(data);
  }

  @UseGuards(AuthGuard('jwt'))
  // @Serialize(UserDto)
  @Get('/me')
  currentUser(@User() user: object): object {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/refresh-token')
  async refreshToken(
    @User() user: { id: number; name: string; email: string },
  ): Promise<object> {
    return await this.authService.refreshToken(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  async authLogout(@User() user: { id: number }): Promise<object> {
    return await this.authService.logout(user.id);
  }
}
