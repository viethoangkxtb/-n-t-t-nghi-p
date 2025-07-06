import {BadRequestException, Injectable} from '@nestjs/common';
import {
  CreateUserDto,
  RegisterUserDto,
  UpdateForNomalUserDTO,
} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectModel} from '@nestjs/mongoose';
import {User as UserM, UserDocument} from './schemas/user.schema';
import mongoose from 'mongoose';
import {compareSync, genSaltSync, hashSync} from 'bcryptjs';
import {SoftDeleteModel} from 'soft-delete-plugin-mongoose';
import {IUser} from './users.interface';
import aqp from 'api-query-params';
import {ConfigService} from '@nestjs/config';
import {Role, RoleDocument} from 'src/roles/schemas/role.schema';
import {ADMIN_ROLE, USER_ROLE} from 'src/databases/sample';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private configService: ConfigService,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    return hash;
  };

  async create(createUserDto: CreateUserDto, user: IUser) {
    const {name, email, password, age, gender, address, role, company} =
      createUserDto;

    const isExist = await this.userModel.findOne({email});

    if (isExist) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại. Vui lòng chọn email khác`,
      );
    }

    const hashPassword = this.getHashPassword(password);

    let newCreateUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newCreateUser;
  }

  async register(registerUserDto: RegisterUserDto) {
    const {name, email, password, age, gender, address} = registerUserDto;

    const isExist = await this.userModel.findOne({email});

    if (isExist) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại. Vui lòng chọn email khác`,
      );
    }

    const userRole = await this.roleModel.findOne({name: USER_ROLE});

    const hashPassword = this.getHashPassword(password);

    let newRegisterUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole?._id,
    });

    return newRegisterUser;
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const {filter, sort, population} = aqp(qs);
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

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const fullPopulation = [
      ...(population || []),
      {path: 'role', select: {name: 1}},
    ];

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(fullPopulation)
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
      return new BadRequestException(
        `Không tìm thấy người dùng với id = ${id}`,
      );
    }

    return await this.userModel
      .findOne({
        _id: id,
      })
      .select('-password')
      .populate({path: 'role', select: {_id: 1, name: 1}}); //exclude >< include
  }

  findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({path: 'role', select: {name: 1}});
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser, _id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new BadRequestException(
        `Không tìm thấy người dùng với id = ${_id}`,
      );
    }

    const updated = await this.userModel.updateOne(
      {_id: _id},
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async updateForNormal(
    updateUserDto: UpdateForNomalUserDTO,
    user: IUser,
    _id: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new BadRequestException(`Không tìm thấy người dùng với = ${_id}`);
    }

    const updated = await this.userModel.updateOne(
      {_id: _id},
      {
        ...updateUserDto,
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
      new BadRequestException(`Không tìm thấy người dùng với = ${id}`);
    }

    const foundUser = await this.userModel.findById(id);

    if (
      foundUser &&
      foundUser.email === this.configService.get<string>('ADMIN_ACCOUNT')
    ) {
      new BadRequestException(`Không thể xóa Admin Account`);
    }

    await this.userModel.updateOne(
      {_id: id},
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.userModel.softDelete({
      _id: id,
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({_id}, {refreshToken});
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel
      .findOne({refreshToken})
      .populate({path: 'role', select: {name: 1}});
  };

  async changePassword(newPassword: string, user: IUser) {
    const hashPassword = this.getHashPassword(newPassword);
    const updated = await this.userModel.updateOne(
      {_id: user._id},
      {
        password: hashPassword,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments({isDeleted: false});
  }
}
