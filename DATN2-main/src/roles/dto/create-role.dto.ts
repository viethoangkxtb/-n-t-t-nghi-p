import {IsArray, IsBoolean, IsMongoId, IsNotEmpty} from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({message: 'Tên là bắt buộc'})
  name: string;

  @IsNotEmpty({message: 'Mô tả là bắt buộc'})
  description: string;

  @IsNotEmpty({message: 'IsActive là bắt buộc'})
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty({message: 'Quyền hạn là bắt buộc'})
  @IsMongoId({each: true, message: 'Mỗi quyền hạn phải là một mongo object id'})
  @IsArray({message: 'Quyền hạn là một mảng'})
  permissions: mongoose.Schema.Types.ObjectId[];
}
