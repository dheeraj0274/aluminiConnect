import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMentorshipRequest extends Document {
  _id: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  areas: string[];
  message: string;
  status: 'requested' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const MentorshipRequestSchema = new Schema<IMentorshipRequest>(
  {
    mentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    areas: [{ type: String, trim: true }],
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'completed'],
      default: 'requested',
    },
  },
  {
    timestamps: true,
  }
);

const MentorshipRequest: Model<IMentorshipRequest> =
  mongoose.models.MentorshipRequest ||
  mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema);

export default MentorshipRequest;
