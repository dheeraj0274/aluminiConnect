import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Basic
  fullName: string;
  profilePhoto: string;
  email: string;
  phone: string;
  graduationYear: number;
  department: string;
  course: string;
  currentCity: string;
  currentCountry: string;
  // Professional
  jobTitle: string;
  company: string;
  industry: string;
  yearsOfExperience: number;
  skills: string[];
  linkedIn: string;
  github: string;
  portfolio: string;
  // Education
  degree: string;
  additionalEducation: string;
  // About
  bio: string;
  professionalSummary: string;
  // Mentorship
  availableForMentorship: boolean;
  mentorshipAreas: string[];
  preferredTopics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, trim: true, default: '' },
    profilePhoto: { type: String, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    graduationYear: { type: Number, default: 0 },
    department: { type: String, trim: true, default: '' },
    course: { type: String, trim: true, default: '' },
    currentCity: { type: String, trim: true, default: '' },
    currentCountry: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    industry: { type: String, trim: true, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    skills: [{ type: String, trim: true }],
    linkedIn: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    additionalEducation: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    professionalSummary: { type: String, trim: true, default: '' },
    availableForMentorship: { type: Boolean, default: false },
    mentorshipAreas: [{ type: String, trim: true }],
    preferredTopics: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
