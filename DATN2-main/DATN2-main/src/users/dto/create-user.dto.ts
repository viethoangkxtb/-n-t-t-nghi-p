import { ApiProperty } from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateUserDto {
  @IsNotEmpty({message: 'Tên  là bắt buộclà bắt buộc'})
  name: string;

  @IsEmail()
  @IsNotEmpty({message: 'Email là bắt buộc'})
  email: string;

  @IsNotEmpty({message: 'Mật khẩu là bắt buộc'})
  password: string;

  @IsNotEmpty({message: 'Tuổi là bắt buộc'})
  age: number;

  @IsNotEmpty({message: 'Giới tính là bắt buộc'})
  gender: string;

  @IsNotEmpty({message: 'Địa chỉ là bắt buộc'})
  address: string;

  @IsNotEmpty({message: 'Vai trò là bắt buộc'})
  @IsMongoId({message: 'Vai trò là một mongo id'})
  role: mongoose.Schema.Types.ObjectId;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({message: 'Tên là bắt buộc'})
  name: string;

  @IsEmail()
  @IsNotEmpty({message: 'Email là bắt buộc'})
  email: string;

  @IsNotEmpty({message: 'Mật khẩu là bắt buộc'})
  password: string;

  @IsNotEmpty({message: 'Tuổi là bắt buộc'})
  age: number;

  @IsNotEmpty({message: 'Giới tính là bắt buộc'})
  gender: string;

  @IsNotEmpty({message: 'Địa chỉ là bắt buộc'})
  address: number;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'admin@gmail.com', description: 'username' })
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
      example: '123456',
      description: 'Mật khẩu',
  })
  readonly password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class UpdateForNomalUserDTO {
  @IsNotEmpty({message: 'Tên là bắt buộc'})
  name: string;

  @IsNotEmpty({message: 'Tuổi là bắt buộc'})
  age: number;

  @IsNotEmpty({message: 'Giới tính là bắt buộc'})
  gender: string;

  // @IsNotEmpty({message: 'Address is required'})
  @IsOptional()
  @IsString()
  address: string;

  // @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}