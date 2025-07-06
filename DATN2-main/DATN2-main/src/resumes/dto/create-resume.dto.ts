import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {

    @IsNotEmpty({ message: 'Email là bắt buộc', })
    email: string;

    @IsNotEmpty({ message: 'UserId là bắt buộc', })
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Url là bắt buộc', })
    url: string;

    @IsNotEmpty({ message: 'Trạng thái là bắt buộc', })
    status: string;

    @IsNotEmpty({ message: 'CompanyId là bắt buộc', })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'JobId là bắt buộc', })
    jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
    @IsNotEmpty({ message: 'Url là bắt buộc', })
    url: string;

    @IsNotEmpty({ message: 'CompanyId là bắt buộc', })
    @IsMongoId({ message: 'companyId phải là mongo id' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'JobId là bắt buộc', })
    @IsMongoId({ message: 'jobId phải là mongo id' })
    jobId: mongoose.Schema.Types.ObjectId;
}