import { IsMongoId, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class JobItem {
  @IsNotEmpty({ message: 'jobId là bắt buộc' })
  @IsMongoId({ message: 'jobId phải là MongoID' })
  jobId: Types.ObjectId;

  @IsNotEmpty({ message: 'companyId là bắt buộc' })
  @IsMongoId({ message: 'companyId phải là MongoID' })
  companyId: Types.ObjectId;

  @IsNotEmpty({ message: 'jobName là bắt buộc' })
  @IsString()
  jobName: string;

  @IsNotEmpty({ message: 'companyName là bắt buộc' })
  @IsString()
  companyName: string;
}

export class CreateFavoriteJobDto {
  @IsNotEmpty({ message: 'userId là bắt buộc' })
  @IsMongoId({ message: 'userId phải là MongoID' })
  userId: Types.ObjectId;

  @IsNotEmpty({ message: 'Danh sách job là bắt buộc' })
  @ValidateNested({ each: true })
  @Type(() => JobItem)
  jobs: JobItem[];
}
