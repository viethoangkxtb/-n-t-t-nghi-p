import {IsNotEmpty} from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({message: "Tên là bắt buộc"})
  name: string;

  @IsNotEmpty({message: "Địa chỉ là bắt buộc"})
  address: string;

  @IsNotEmpty({message: "Mô tả là bắt buộc"})
  description: string;

  @IsNotEmpty({message: "Logo là bắt buộc"})
  logo: string;
}
