import { Router } from 'express';
import { getAllQuestionPackages, createQuestionPackage, updateQuestionPackage, deleteQuestionPackage } from '../controllers/questionPackageController';

const router = Router();

router.get('/question-packages', getAllQuestionPackages);
router.post('/question-packages', createQuestionPackage);
router.put('/question-packages/:id', updateQuestionPackage);
router.delete('/question-packages/:id', deleteQuestionPackage);

export default router;