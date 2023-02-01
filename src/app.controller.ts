import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Render,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { RegisterDto } from './register.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import { ChangeUserDto } from './changeuser.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    if (
      !registerDto.email ||
      !registerDto.password ||
      !registerDto.passwordAgain
    ) {
      throw new BadRequestException('All fields are required');
    }
    if (!registerDto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ charachter');
    }
    if (registerDto.password !== registerDto.passwordAgain) {
      throw new BadRequestException('The two passwords must match!');
    }
    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'The password must be at least 8 charachter long!',
      );
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.email = registerDto.email;
    user.password = await bcrypt.hash(registerDto.password, 15);
    await userRepo.save(user);

    delete user.password;

    return user;
  }

  @Patch('/users/:id')
  async changeuser(@Param('id') id: number, changeUserDto: ChangeUserDto) {
    if (!changeUserDto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ charachter');
    }
    if (changeUserDto.profilePictureUrl == '') {
      changeUserDto.profilePictureUrl = '';
    } else if (
      !changeUserDto.profilePictureUrl.startsWith('http') ||
      !changeUserDto.profilePictureUrl.startsWith('https')
    ) {
      throw new BadRequestException('Profile picture must be linked in');
    }

    const changeuserRepo = this.dataSource.getRepository(User);
    const user = await changeuserRepo.findOneBy({ id: id });
    user.email = changeUserDto.email;
    user.profilePictureUrl = changeUserDto.profilePictureUrl;
    await changeuserRepo.save(user);

    return user;
  }
}
