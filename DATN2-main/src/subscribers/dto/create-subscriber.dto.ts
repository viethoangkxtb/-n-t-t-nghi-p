import {IsArray, IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({message: 'Tên là bắt buộc'})
  name: string;

  @IsNotEmpty({message: 'Email là bắt buộc'})
  @IsEmail()
  email: string;

  @IsNotEmpty({message: 'Kỹ năng là bắt buộc'})
  @IsArray()
  @IsString({each: true, message: 'Mỗi kỹ năng là một chuỗi'})
  skills: string[];
}
