import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  text: string;
  minutes: number;
  order: number;
}

export interface IQuestionPackage extends Document {
  title: string;
  questions: Types.DocumentArray<IQuestion>;
}

const QuestionSchema = new Schema<IQuestion>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  text: { type: String, required: true },
  minutes: { type: Number, required: true },
  order: { type: Number, required: true }
});

const QuestionPackageSchema = new Schema<IQuestionPackage>({
  title: { type: String, required: true },
  questions: [QuestionSchema]
});

const QuestionPackage = model<IQuestionPackage>('QuestionPackage', QuestionPackageSchema);

export default QuestionPackage;