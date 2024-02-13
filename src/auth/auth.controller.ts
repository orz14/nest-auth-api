import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
  async authRegister(@Body() data: CreateUserDto): Promise<any> {
    return await this.userService.create(data);
  }

  @Post('/login')
  async authLogin(@Body() data: LoginDto): Promise<any> {
    return await this.authService.login(data);
  }

  @UseGuards(AuthGuard('jwt'))
  // @Serialize(UserDto)
  @Get('/me')
  currentUser(@User() user: object): any {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/refresh-token')
  async refreshToken(
    @User() user: { id: number; name: string; email: string },
  ): Promise<any> {
    return await this.authService.refreshToken(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  async authLogout(@User() user: { id: number }): Promise<any> {
    return await this.authService.logout(user.id);
  }
}
