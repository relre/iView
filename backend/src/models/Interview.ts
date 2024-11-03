import mongoose, { Document, Schema, Types } from 'mongoose';
import { IQuestionPackage } from './QuestionPackage';

export interface IApplication {
  _id: Types.ObjectId;
  name: string;
  surname: string;
  email: string;
  phone: string;
  gdprConsent: boolean;
  videoUrl: string;
  datax: {
    transcript: string;
    sentiment: {
      label: string;
      score: number;
    };
    emotions: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
}

export interface IInterview extends Document {
  title: string;
  totalCandidates: number;
  onHoldCandidates: number;
  isPublished: boolean;
  link: string;
  questionPacks: Types.DocumentArray<IQuestionPackage>;
  expireDate: Date;
  questions: {
    text: string;
    minutes: number;
    order: number;
  }[];
  applications: IApplication[];
}

const InterviewSchema: Schema = new Schema({
  title: { type: String, required: true },
  totalCandidates: { type: Number, default: 1 },
  onHoldCandidates: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  link: { type: String, required: false },
  questionPacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionPackage' }],
  expireDate: { type: Date, required: true },
  questions: [{
    text: { type: String, required: true },
    minutes: { type: Number, required: true },
    order: { type: Number, required: false },
  }],
  applications: [{
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    gdprConsent: { type: Boolean, required: true },
    videoUrl: { type: String, required: true },
    datax: {
      transcript: { type: String, required: false },
      sentiment: {
        label: { type: String, required: false },
        score: { type: Number, required: false },
      },
      emotions: { type: [String], required: false },
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  }],
});

const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
export default Interview;