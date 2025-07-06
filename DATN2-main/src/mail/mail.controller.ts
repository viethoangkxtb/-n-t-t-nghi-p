import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {MailService} from './mail.service';
import {Public, ResponseMessage} from 'src/decorator/customize';
import {MailerService} from '@nestjs-modules/mailer';
import {SoftDeleteModel} from 'soft-delete-plugin-mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';
import {Job, JobDocument} from 'src/jobs/schemas/job.schema';
import {InjectModel} from '@nestjs/mongoose';
import {Cron, CronExpression} from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { Resume, ResumeDocument } from 'src/resumes/schemas/resume.schema';
import { ResumesService } from 'src/resumes/resumes.service';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,

    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,

    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  @Cron('0 30 10 * * 0') // 10:30 AM every Sunday
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: {$in: subsSkills},
      });
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            _id: item._id.toString(),
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills,
          };
        });

        await this.mailerService.sendMail({
          to: 'viethoangkxtb@gmail.com',
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Gợi ý việc làm theo kỹ năng – cập nhật mới nhất',
          template: 'new-job',
          context: {
            receiver: subs.name,
            jobs: jobs,
          },
        });
      }
    }
  }

  // @Post('/approve-email/:id')
  // @Public()
  // @ResponseMessage('Approve email')
  // async handleApproveEmail(@Param('id') id: string) {
  //   const resume = await this.resumeModel.findOne({ _id: id });
  //   if (!resume || !resume.email) {
  //     throw new Error('Resume not found or email is missing');
  //   }

  //   await this.mailService.sendApprovalEmail(resume.email, );
  //   return { message: 'Email sent successfully' };
  // }

  @Post('approve-email')
  @Public()
  @ResponseMessage('Send approve interview email')
  async sendInterviewEmail(@Body() body: {
    to: string;
    from: string;
    companyName: string;
    name: string;
    jobTitle: string;
    interviewTime: string;
    interviewType: string;
    interviewLocation: string;
    jobLink: string;
    senderName: string;
    senderTitle: string;
    senderPhone: string;
    senderEmail: string;
  }) {
    // console.log('Dữ liệu gửi email:', body);
    await this.mailService.sendInterviewEmail(body);
    return { message: 'Email chấp nhận đã được gửi thành công' };
  }

  @Post('reject-email')
  @Public()
  @ResponseMessage('Send reject email')
  async sendRejectEmail(@Body() body: {
    to: string;
    from: string;
    companyName: string;
    name: string;
    jobTitle: string;
    senderName: string;
    senderTitle: string;
    senderPhone: string;
    senderEmail: string;
    customMessage: string;
  }) {
    
    await this.mailService.sendRejectEmail(body);
    return { message: 'Email từ chối đã được gửi thành công' };
  }
}
