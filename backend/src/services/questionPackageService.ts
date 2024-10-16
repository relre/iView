import QuestionPackage from '../models/QuestionPackage';

export const getAllQuestionPackages = async () => {
  return await QuestionPackage.find();
};

export const createQuestionPackage = async (title: string, questions: Array<{ text: string; minutes: number; order: number; }>) => {
  const newQuestionPackage = new QuestionPackage({
    title,
    questions,
  });
  return await newQuestionPackage.save();
};

export const updateQuestionPackage = async (id: string, title: string, questions: Array<{ text: string; minutes: number; order: number; }>) => {
  return await QuestionPackage.findByIdAndUpdate(id, { title, questions }, { new: true });
};

export const deleteQuestionPackage = async (id: string) => {
  return await QuestionPackage.findByIdAndDelete(id);
};