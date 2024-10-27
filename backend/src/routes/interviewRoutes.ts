import { Router } from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  addApplication,
  getApplications,
  updateApplicationStatus,
  getApplicationById,
} from '../controllers/interviewController';

const router = Router();

router.post('/interview', createInterview);
router.get('/interview', getInterviews);
router.get('/interview/:id', getInterviewById);
router.put('/interview/:id', updateInterview);
router.delete('/interview/:id', deleteInterview);

// Application routes
router.post('/interview/:id/applications', addApplication);
router.get('/interview/:id/applications', getApplications);
router.put('/interview/:id/applications/:applicationId', updateApplicationStatus);
router.get('/interview/:id/applications/:applicationId', getApplicationById); 

export default router;