import { Request, Response } from 'express';
import { getAllQuestionPackages as getAllQuestionPackagesService, createQuestionPackage as createQuestionPackageService, updateQuestionPackage as updateQuestionPackageService, deleteQuestionPackage as deleteQuestionPackageService } from '../services/questionPackageService';

export const getAllQuestionPackages = async (req: Request, res: Response) => {
  try {
    const questionPackages = await getAllQuestionPackagesService();
    res.json(questionPackages);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createQuestionPackage = async (req: Request, res: Response) => {
  const { title, questions } = req.body;

  try {
    const savedQuestionPackage = await createQuestionPackageService(title, questions);
    res.status(201).json(savedQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateQuestionPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, questions } = req.body;

  try {
    const updatedQuestionPackage = await updateQuestionPackageService(id, title, questions);
    if (!updatedQuestionPackage) {
      return res.status(404).json({ message: 'Question Package not found' });
    }
    res.json(updatedQuestionPackage);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteQuestionPackage = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedQuestionPackage = await deleteQuestionPackageService(id);
    if (!deletedQuestionPackage) {
      return res.status(404).json({ message: 'Question Package not found' });
    }
    res.json({ message: 'Question Package deleted' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};