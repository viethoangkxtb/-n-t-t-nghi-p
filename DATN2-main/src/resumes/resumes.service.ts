import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {CreateResumeDto, CreateUserCvDto} from './dto/create-resume.dto';
import {UpdateResumeDto} from './dto/update-resume.dto';
import {IUser} from 'src/users/users.interface';
import {InjectModel} from '@nestjs/mongoose';
import {Resume, ResumeDocument} from './schemas/resume.schema';
import {SoftDeleteModel} from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import {ADMIN_ROLE} from 'src/databases/sample';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const {url, companyId, jobId} = createUserCvDto;
    const {email, _id} = user;

    const newCv = await this.resumeModel.create({
      url,
      companyId,
      email,
      jobId,
      userId: _id,
      status: 'PENDING',
      createdBy: {_id, email},
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ],
    });

    return {
      _id: newCv?._id,
      createdAt: newCv?.createdAt,
    };
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel
      .find({
        userId: user._id,
      })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: {name: 1},
        },
        {
          path: 'jobId',
          select: {name: 1},
        },
      ]);
  }

  async removeForUser(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }

    const foundResume = await this.resumeModel.findById(id);

    if (!foundResume) {
      throw new NotFoundException(`Không tìm thấy đơn xin việc với id = ${id}`);
    }

    if (foundResume.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException(`Bạn không có quyền xóa đơn xin việc này`);
    }

    if (foundResume.status !== 'PENDING') {
      throw new BadRequestException(
        'Bạn không thể xóa đơn xin việc đã được tiếp nhận',
      );
    }

    await this.resumeModel.updateOne(
      {_id: id},
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.resumeModel.softDelete({_id: id});
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const {filter, sort, projection, population} = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (user && user.role.name !== ADMIN_ROLE) {
      const companyId = user.company._id;
      if (companyId) {
        filter['companyId'] = companyId;
      }
    }

    const fullPopulation = [
      ...(population || []),
      {path: 'companyId', select: {name: 1}},
      {path: 'jobId', select: {name: 1}},
      {path: 'userId', select: 'name'},
    ];

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(fullPopulation)
      // .populate({path: 'userId', select: 'name'})
      .select(projection as any)
      .exec();

    const modifiedResult = result.map(doc => ({
      ...doc.toObject(),
      nameLogin: user?.name || 'N/A',
      userLogin: user?.email || 'N/A',
    }));

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result: modifiedResult, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new BadRequestException(
        `Không tìm thấy đơn xin việc với id = ${id}`,
      );
    }

    return await this.resumeModel
      .findById(id)
      .populate({path: 'userId', select: 'name'});
  }

  async update(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new BadRequestException(
        `Không tìm thấy đơn xin việc với id = ${_id}`,
      );
    }

    const updated = await this.resumeModel.updateOne(
      {
        _id,
      },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new BadRequestException(
        `Không tìm thấy đơn xin việc với id = ${id}`,
      );
    }

    await this.resumeModel.updateOne(
      {_id: id},
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.resumeModel.softDelete({_id: id});
  }
}
