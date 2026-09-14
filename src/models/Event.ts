import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  image: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  eventType: 'online' | 'offline' | 'hybrid';
  meetingLink: string;
  organizer: mongoose.Types.ObjectId;
  maxParticipants: number;
  registrationDeadline: Date;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    image: { type: String, default: '' },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, trim: true, default: '' },
    eventType: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline',
    },
    meetingLink: { type: String, default: '' },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxParticipants: { type: Number, default: 100 },
    registrationDeadline: { type: Date },
    registeredCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
