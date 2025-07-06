import {IsNotEmpty} from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({message: 'Tên là bắt buộc'})
  name: string;

  @IsNotEmpty({message: 'ApiPath là bắt buộc'})
  apiPath: string;

  @IsNotEmpty({message: 'Phương thức là bắt buộc'})
  method: string;

  @IsNotEmpty({message: 'Module là bắt buộc'})
  module: string;
}
