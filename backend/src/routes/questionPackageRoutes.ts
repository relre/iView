import { Router } from 'express';
import {
  getAllQuestionPackages,
  createQuestionPackage,
  updateQuestionPackage,
  deleteQuestionPackage,
  getQuestionsByPackageId,
  addQuestionToPackage,
  updateQuestionInPackage,
  deleteQuestionFromPackage
} from '../controllers/questionPackageController';

const router = Router();

router.get('/question-packages', getAllQuestionPackages);
router.post('/question-packages', createQuestionPackage);
router.put('/question-packages/:id', updateQuestionPackage);
router.delete('/question-packages/:id', deleteQuestionPackage);

// Question routes
router.get('/question-packages/:id/questions', getQuestionsByPackageId);
router.post('/question-packages/:id/questions', addQuestionToPackage);
router.put('/question-packages/:id/questions/:questionId', updateQuestionInPackage);
router.delete('/question-packages/:id/questions/:questionId', deleteQuestionFromPackage);

export default router;