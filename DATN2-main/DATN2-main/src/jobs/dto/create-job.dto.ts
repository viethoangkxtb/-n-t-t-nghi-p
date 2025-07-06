import {Transform, Type} from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty({message: '_id công ty là bắt buộc'})
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({message: 'Tên công ty là bắt buộc'})
  name: string;

  @IsNotEmpty({message: 'Logo công ty là bắt buộc'})
  logo: string;
}

export class CreateJobDto {
  @IsNotEmpty({message: 'Tên công việc là bắt buộc'})
  name: string;

  @IsNotEmpty({message: 'Kỹ năng là bắt buộc'})
  @IsArray({message: 'Các kỹ năng là một mảng'})
  @IsString({each: true, message: 'Mỗi kỹ năng là một chuỗi'})
  skills: string[];

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsNotEmpty({message: 'Vị trí là bắt buộc'})
  location: string;

  @IsNotEmpty({message: 'Lương là bắt buộc'})
  salary: number;

  @IsNotEmpty({message: 'Số lượng là bắt buộc'})
  quantity: number;

  @IsNotEmpty({message: 'Level là bắt buộc'})
  level: string;

  @IsNotEmpty({message: 'Mô tả là bắt buộc'})
  description: string;

  @IsNotEmpty({message: 'Ngày bắt đầu là bắt buộc'})
  @Transform(({value}) => new Date(value))
  @IsDate()
  startDate: Date;

  @IsNotEmpty({message: 'Ngày kết thúc là bắt buộc'})
  @Transform(({value}) => new Date(value))
  @IsDate()
  endDate: Date;

  @IsNotEmpty({message: 'IsActive là bắt buộc'})
  isActive: boolean;
}
