import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddJobToFavoriteDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'jobId phải là MongoID' })
  jobId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId({ message: 'companyId phải là MongoID' })
  companyId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  jobName: string;

  @IsNotEmpty()
  @IsString()
  companyName: string;
}
