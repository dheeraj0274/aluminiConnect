import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote';
  experienceRequired: string;
  skillsRequired: string[];
  salaryRange: string;
  applicationUrl: string;
  postedBy: mongoose.Types.ObjectId;
  status: 'active' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    location: { type: String, trim: true, default: '' },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      default: 'full-time',
    },
    experienceRequired: { type: String, trim: true, default: '' },
    skillsRequired: [{ type: String, trim: true }],
    salaryRange: { type: String, trim: true, default: '' },
    applicationUrl: { type: String, trim: true, default: '' },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'pending'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ status: 1, createdAt: -1 });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
