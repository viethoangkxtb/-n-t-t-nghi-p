import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {CreateJobDto} from './dto/create-job.dto';
import {UpdateJobDto} from './dto/update-job.dto';
import {IUser} from 'src/users/users.interface';
import {InjectModel} from '@nestjs/mongoose';
import {Job, JobDocument} from './schemas/job.schema';
import {SoftDeleteModel} from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import {ADMIN_ROLE} from 'src/databases/sample';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    if (user.role.name !== 'SUPER_ADMIN') {
      if (
        !createJobDto.company ||
        String(createJobDto.company._id) !== String(user.company._id)
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền tạo job cho công ty khác',
        );
      }
    }

    if (createJobDto.startDate > createJobDto.endDate) {
      throw new BadRequestException('Ngày bắt đầu phải ở trước ngày kết thúc');
    }

    let job = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: job._id,
      createAt: job.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const {filter, sort, projection, population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findAllForHR(
    currentPage: number,
    limit: number,
    qs: string,
    user: IUser,
  ) {
    const {filter, sort, projection, population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (user && user.role.name !== ADMIN_ROLE) {
      const companyId = user.company._id;
      if (companyId) {
        filter['company._id'] = companyId;
      }
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new BadRequestException(`Không tìm thấy công việc với id = ${id}`);
    }

    return await this.jobModel.findById(id);
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new BadRequestException(`Không tìm thấy công việc với id = ${id}`);
    }

    const updated = await this.jobModel.updateOne(
      {_id: id},
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new BadRequestException(`Không tìm thấy công việc với id = ${id}`);
    }

    await this.jobModel.updateOne(
      {_id: id},
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.jobModel.softDelete({_id: id});
  }

  async countJobs(): Promise<number> {
    return this.jobModel.countDocuments({
      isDeleted: false,
      isActive: true,
    });
  }
}
