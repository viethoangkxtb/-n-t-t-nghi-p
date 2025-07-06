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
import {JobsService} from './jobs.service';
import {CreateJobDto} from './dto/create-job.dto';
import {UpdateJobDto} from './dto/update-job.dto';
import {Public, ResponseMessage, User} from 'src/decorator/customize';
import {IUser} from 'src/users/users.interface';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ResponseMessage('Create a Job')
  @Post()
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Public()
  @ResponseMessage('Fetch all Jobs with pagination')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Get total jobs')
  @Post('/total')
  async getTotalJobs() {
    const total = await this.jobsService.countJobs();
    return {total};
  }

  @ResponseMessage('Fetch all Jobs with pagination for HR')
  @Post('/hr')
  findAllForHR(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.jobsService.findAllForHR(+currentPage, +limit, qs, user);
  }

  @Public()
  @ResponseMessage('Fetch a Job by Id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @ResponseMessage('Update a Job')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser,
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @ResponseMessage('Delete a Job')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
