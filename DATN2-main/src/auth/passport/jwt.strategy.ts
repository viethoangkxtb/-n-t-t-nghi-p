import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {BadRequestException, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {IUser} from 'src/users/users.interface';
import {RolesService} from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: IUser) {
    const {_id, name, email, role} = payload;

    const userRole = role as unknown as {_id: string; name: string};
    const temp = await this.rolesService.findOne(userRole._id);

    if (temp instanceof BadRequestException) {
      throw temp;
    }

    const temp1 = temp.toObject();

    const userTest = await this.usersService.findOne(_id);
    if (userTest instanceof BadRequestException) {
      throw userTest;
    }
    const company = userTest.company || 'Bạn không thuộc công ty nào';

    return {
      _id,
      name,
      email,
      role,
      company,
      permissions: temp1?.permissions ?? [],
    };
  }
}
