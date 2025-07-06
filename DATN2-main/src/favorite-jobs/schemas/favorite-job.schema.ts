import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {HydratedDocument} from 'mongoose';
import {Company} from 'src/companies/schemas/company.schema';
import {Job} from 'src/jobs/schemas/job.schema';
import {User} from 'src/users/schemas/user.schema';

export type FavoriteJobDocument = HydratedDocument<FavoriteJob>;

@Schema({timestamps: true})
export class FavoriteJob {
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true})
  userId: mongoose.Schema.Types.ObjectId;

  @Prop([
    {
      jobId: {type: mongoose.Types.ObjectId, ref: Job.name},
      companyId: {type: mongoose.Types.ObjectId, ref: Company.name},
      jobName: {type: String},
      companyName: {type: String},
    },
  ])
  jobs: {
    jobId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    jobName: string;
    companyName: string;
  }[];

  @Prop({type: Object})
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({type: Object})
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({type: Object})
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const FavoriteJobSchema = SchemaFactory.createForClass(FavoriteJob);
