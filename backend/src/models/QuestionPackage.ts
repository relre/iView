import mongoose, { Schema, Document } from 'mongoose';

interface IQuestionPackage extends Document {
  title: string;
  questions: Array<{
    text: string;
    minutes: number;
    order: number;
  }>;
}

const QuestionPackageSchema: Schema = new Schema({
  title: { type: String, required: true },
  questions: [{
    text: { type: String, required: true },
    minutes: { type: Number, required: true },
    order: { type: Number, required: true },
  }],
});

const QuestionPackage = mongoose.model<IQuestionPackage>('QuestionPackage', QuestionPackageSchema);
export default QuestionPackage;