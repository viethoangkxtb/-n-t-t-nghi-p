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
import {ResumesService} from './resumes.service';
import {CreateUserCvDto} from './dto/create-resume.dto';
import {ResponseMessage, User} from 'src/decorator/customize';
import {IUser} from 'src/users/users.interface';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ResponseMessage('Create a new resume')
  @Post()
  create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createUserCvDto, user);
  }

  @ResponseMessage('Get Resumes by user')
  @Post('by-user')
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }

  @ResponseMessage('Delete a Resume for User')
  @Post('withdraw-my-CV/:id')
  removeForUser(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.removeForUser(id, user);
  }

  @ResponseMessage('Fetch all Resumes with pagination')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs, user);
  }

  @ResponseMessage('Fetch a Resume by Id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @ResponseMessage('Update resume status')
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @ResponseMessage('Delete a Resume')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
