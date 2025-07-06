import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {CompaniesService} from './companies.service';
import {CreateCompanyDto} from './dto/create-company.dto';
import {UpdateCompanyDto} from './dto/update-company.dto';
import {Public, ResponseMessage, User} from 'src/decorator/customize';
import {IUser} from 'src/users/users.interface';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ResponseMessage('Create a Company')
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Public()
  @ResponseMessage('Get total companies')
  @Post('/total')
  async getTotalCompanies() {
    const total = await this.companiesService.countCompanies();
    return {total};
  }

  @ResponseMessage('Fetch all Companies with pagination for HR')
  @Post('/hr')
  findAllForHR(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.companiesService.findAllForHR(+currentPage, +limit, qs, user);
  }

  @Public()
  @ResponseMessage('Fetch all Companies with pagination')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.companiesService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Fetch a Company by Id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @ResponseMessage('Update a Company')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @ResponseMessage('Delete a Company')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
}
