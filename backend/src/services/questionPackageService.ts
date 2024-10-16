import { Types } from 'mongoose';
import QuestionPackage, { IQuestionPackage, IQuestion } from '../models/QuestionPackage';

export const getAllQuestionPackagesService = async (): Promise<IQuestionPackage[]> => {
  try {
    const questionPackages = await QuestionPackage.find();
    return questionPackages;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const createQuestionPackageService = async (title: string): Promise<IQuestionPackage> => {
  try {
    const newQuestionPackage = new QuestionPackage({ title, questions: [] });
    await newQuestionPackage.save();
    return newQuestionPackage;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const updateQuestionPackageService = async (id: string, title: string): Promise<IQuestionPackage | null> => {
  try {
    const updatedQuestionPackage = await QuestionPackage.findByIdAndUpdate(id, { title }, { new: true });
    return updatedQuestionPackage;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const deleteQuestionPackageService = async (id: string): Promise<IQuestionPackage | null> => {
  try {
    const deletedQuestionPackage = await QuestionPackage.findByIdAndDelete(id);
    return deletedQuestionPackage;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const getQuestionsByPackageIdService = async (id: string): Promise<IQuestion[]> => {
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      throw new Error('Question package not found');
    }
    return questionPackage.questions;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const addQuestionToPackageService = async (packageId: string, question: IQuestion): Promise<IQuestionPackage> => {
  try {
    const questionPackage = await QuestionPackage.findById(packageId);
    if (!questionPackage) {
      throw new Error('Question package not found');
    }
    questionPackage.questions.push(question);
    await questionPackage.save();
    return questionPackage;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const updateQuestionInPackageService = async (packageId: string, questionId: string, question: Partial<IQuestion>): Promise<IQuestionPackage> => {
  try {
    const questionPackage = await QuestionPackage.findById(packageId);
    if (!questionPackage) {
      throw new Error('Question package not found');
    }
    const questionToUpdate = questionPackage.questions.id(questionId);
    if (!questionToUpdate) {
      throw new Error('Question not found');
    }
    questionToUpdate.set(question);
    await questionPackage.save();
    return questionPackage;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};

export const deleteQuestionFromPackageService = async (packageId: string, questionId: string): Promise<IQuestionPackage> => {
  try {
    const questionPackage = await QuestionPackage.findById(packageId);
    if (!questionPackage) {
      throw new Error('Question package not found');
    }
    questionPackage.questions.pull({ _id: questionId });
    await questionPackage.save();
    return questionPackage;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred');
  }
};