import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto, UpdateForNomalUserDTO} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {Public, ResponseMessage, User} from 'src/decorator/customize';
import {IUser} from './users.interface';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('Create a new User')
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.create(createUserDto, user);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  @ResponseMessage('Fetch all Users with pagination')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs, user);
  }

  @Public()
  @ResponseMessage('Get total users')
  @Get('/total')
  async getTotalUsers() {
    const total = await this.usersService.countUsers();
    return {total};
  }

  @Public()
  @ResponseMessage('Fetch User by Id')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  @ResponseMessage('Update a User')
  @Patch(':id')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
    @Param('id') id: string,
  ) {
    let updateUser = await this.usersService.update(updateUserDto, user, id);
    return updateUser;
  }

  @ResponseMessage('Update a User')
  @Post(':id')
  async updateForNormal(
    @Body() updateUserDto: UpdateForNomalUserDTO,
    @User() user: IUser,
    @Param('id') id: string,
  ) {
    let updateUser = await this.usersService.updateForNormal(
      updateUserDto,
      user,
      id,
    );
    return updateUser;
  }

  @ResponseMessage('Delete a User')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
