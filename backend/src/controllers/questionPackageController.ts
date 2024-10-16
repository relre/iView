import { Request, Response } from 'express';
import QuestionPackage from '../models/QuestionPackage';

export const getAllQuestionPackages = async (req: Request, res: Response) => {
  try {
    const questionPackages = await QuestionPackage.find();
    res.json(questionPackages);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createQuestionPackage = async (req: Request, res: Response) => {
  const { title } = req.body;
  try {
    const newQuestionPackage = new QuestionPackage({ title, questions: [] });
    await newQuestionPackage.save();
    res.status(201).json(newQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateQuestionPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const updatedQuestionPackage = await QuestionPackage.findByIdAndUpdate(id, { title }, { new: true });
    if (!updatedQuestionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    res.json(updatedQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteQuestionPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedQuestionPackage = await QuestionPackage.findByIdAndDelete(id);
    if (!deletedQuestionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    res.json(deletedQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getQuestionsByPackageId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    res.json(questionPackage.questions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addQuestionToPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, minutes, order } = req.body;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    questionPackage.questions.push({ text, minutes, order });
    await questionPackage.save();
    res.json(questionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateQuestionInPackage = async (req: Request, res: Response) => {
  const { id, questionId } = req.params;
  const { text, minutes, order } = req.body;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    const question = questionPackage.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    question.set({ text, minutes, order });
    await questionPackage.save();
    res.json(questionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteQuestionFromPackage = async (req: Request, res: Response) => {
  const { id, questionId } = req.params;
  try {
    const questionPackage = await QuestionPackage.findById(id);
    if (!questionPackage) {
      return res.status(404).json({ message: 'Question package not found' });
    }
    questionPackage.questions.pull({ _id: questionId });
    await questionPackage.save();
    res.json(questionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};