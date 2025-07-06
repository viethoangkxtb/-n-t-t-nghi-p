import { Module } from '@nestjs/common';
import { FavoriteJobService } from './favorite-jobs.service';
import { FavoriteJobController } from './favorite-jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteJob, FavoriteJobSchema } from './schemas/favorite-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FavoriteJob.name, schema: FavoriteJobSchema },
    ]),
  ],
  controllers: [FavoriteJobController],
  providers: [FavoriteJobService]
})
export class FavoriteJobsModule {}
