import {OmitType} from '@nestjs/mapped-types';
import {CreateJobDto} from './create-job.dto';

export class UpdateJobDto extends OmitType(CreateJobDto, []) {
  _id: string;
}
