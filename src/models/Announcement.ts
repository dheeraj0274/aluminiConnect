import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image: string;
  date: Date;
  author: mongoose.Types.ObjectId;
  category: 'college-news' | 'alumni-news' | 'events' | 'career' | 'general';
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
    },
    image: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['college-news', 'alumni-news', 'events', 'career', 'general'],
      default: 'general',
    },
    published: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
