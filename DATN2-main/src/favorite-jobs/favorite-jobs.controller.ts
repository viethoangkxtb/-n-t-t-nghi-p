import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import {FavoriteJobService} from './favorite-jobs.service';
import {CreateFavoriteJobDto} from './dto/create-favorite-job.dto';
import {UpdateFavoriteJobDto} from './dto/update-favorite-job.dto';
import {AddJobToFavoriteDto} from './dto/add-job-to-favorite.dto';
import {Types} from 'mongoose';
import {ResponseMessage, User} from 'src/decorator/customize';
import {IUser} from 'src/users/users.interface';

@Controller('favorite-jobs')
export class FavoriteJobController {
  constructor(private readonly favoriteJobService: FavoriteJobService) {}

  @Post()
  create(@Body() createDto: CreateFavoriteJobDto) {
    return this.favoriteJobService.create(createDto);
  }

  @ResponseMessage('Get Favorite Jobs by user')
  @Post('me')
  getResumesByUser(@User() user: IUser) {
    return this.favoriteJobService.findByUsers(user);
  }

  @ResponseMessage('Add new favorite-jobs')
  @Post('/add-job')
  addJob(@Body() jobDto: AddJobToFavoriteDto, @User() user: IUser) {
    return this.favoriteJobService.addJobToUserFavorites(user, jobDto);
  }

  @ResponseMessage('Remove new favorite-jobs')
  @Delete('/remove-job/:id')
  removeJob(@User() user: IUser, @Param('id') jobId: string) {
    return this.favoriteJobService.removeJobFromFavorites(
      user,
      new Types.ObjectId(jobId),
    );
  }

  @ResponseMessage('Check job in favorite')
  @Get('/check-job/:id')
  checkJobInFavorite(@User() user: IUser, @Param('id') jobId: string) {
    return this.favoriteJobService.isJobInFavorites(
      user,
      new Types.ObjectId(jobId),
    );
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.favoriteJobService.findByUserId(new Types.ObjectId(userId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFavoriteJobDto) {
    return this.favoriteJobService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoriteJobService.remove(id);
  }
}
