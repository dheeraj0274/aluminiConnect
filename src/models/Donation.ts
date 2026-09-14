import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: 'student-scholarships' | 'campus-development' | 'education-support' | 'alumni-initiatives';
  donorsCount: number;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    category: {
      type: String,
      enum: ['student-scholarships', 'campus-development', 'education-support', 'alumni-initiatives'],
      default: 'alumni-initiatives',
    },
    donorsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);

export default Donation;
