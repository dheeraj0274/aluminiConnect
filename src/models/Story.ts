import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStory extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  story: string;
  author: mongoose.Types.ObjectId;
  profilePhoto: string;
  company: string;
  designation: string;
  graduationYear: number;
  category: 'career' | 'achievement' | 'entrepreneurship' | 'education' | 'milestone';
  status: 'pending' | 'approved' | 'rejected';
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
    },
    story: {
      type: String,
      required: [true, 'Story content is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profilePhoto: { type: String, default: '' },
    company: { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },
    graduationYear: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['career', 'achievement', 'entrepreneurship', 'education', 'milestone'],
      default: 'career',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    published: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Story: Model<IStory> =
  mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);

export default Story;
