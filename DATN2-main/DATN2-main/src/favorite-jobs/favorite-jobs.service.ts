import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FavoriteJob, FavoriteJobDocument} from './schemas/favorite-job.schema';
import {Model, Types} from 'mongoose';
import {CreateFavoriteJobDto} from './dto/create-favorite-job.dto';
import {UpdateFavoriteJobDto} from './dto/update-favorite-job.dto';
import {AddJobToFavoriteDto} from './dto/add-job-to-favorite.dto';
import {IUser} from 'src/users/users.interface';

@Injectable()
export class FavoriteJobService {
  constructor(
    @InjectModel(FavoriteJob.name)
    private readonly favoriteJobModel: Model<FavoriteJobDocument>,
  ) {}

  async create(dto: CreateFavoriteJobDto) {
    return this.favoriteJobModel.create(dto);
  }

  async findByUsers(user: IUser) {
    return await this.favoriteJobModel
      .find({
        userId: user._id,
      })
      .sort('-createdAt');
    // .populate([
    //   {
    //     path: 'companyId',
    //     select: {name: 1},
    //   },
    //   {
    //     path: 'jobId',
    //     select: {name: 1},
    //   },
    // ]);
  }

  async findByUserId(userId: Types.ObjectId) {
    return this.favoriteJobModel.findOne({userId});
  }

  async update(id: string, dto: UpdateFavoriteJobDto) {
    return this.favoriteJobModel.findByIdAndUpdate(id, dto, {new: true});
  }

  async remove(id: string) {
    return this.favoriteJobModel.findByIdAndDelete(id);
  }

  async addJobToUserFavorites(user: IUser, jobDto: AddJobToFavoriteDto) {
    const userId = user._id;
    const existing = await this.favoriteJobModel.findOne({userId});

    const newJob = {
      jobId: jobDto.jobId,
      companyId: jobDto.companyId,
      jobName: jobDto.jobName,
      companyName: jobDto.companyName,
    };

    if (existing) {
      const alreadyExists = existing.jobs.some(j =>
        j.jobId.equals(jobDto.jobId),
      );

      if (!alreadyExists) {
        existing.jobs.push(newJob);
        return existing.save();
      }

      return existing; // đã tồn tại, không thêm lại
    }

    return this.favoriteJobModel.create({
      userId,
      jobs: [newJob],
    });
  }

  async removeJobFromFavorites(user: IUser, jobId: Types.ObjectId) {
    const userId = user._id;
    return this.favoriteJobModel.updateOne({userId}, {$pull: {jobs: {jobId}}});
  }

  async isJobInFavorites(user: IUser, jobId: Types.ObjectId) {
    const favorite = await this.favoriteJobModel.findOne({
      userId: user._id,
      'jobs.jobId': jobId,
    });

    return !!favorite; // true nếu tồn tại
  }
}
