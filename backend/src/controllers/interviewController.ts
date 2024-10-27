import { Request, Response } from 'express';
import * as interviewService from '../services/interviewService';

export const createInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await interviewService.createInterview(req.body);
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating interview', error });
  }
};

export const getInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const interviews = await interviewService.getInterviews();
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews', error });
  }
};

export const getInterviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await interviewService.getInterviewById(req.params.id);
    if (interview) {
      res.status(200).json(interview);
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview', error });
  }
};

export const updateInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await interviewService.updateInterview(req.params.id, req.body);
    if (interview) {
      res.status(200).json(interview);
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating interview', error });
  }
};

export const deleteInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await interviewService.deleteInterview(req.params.id);
    if (interview) {
      res.status(200).json({ message: 'Interview deleted successfully' });
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting interview', error });
  }
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`Request params: ${JSON.stringify(req.params)}`);
    const application = await interviewService.getApplicationById(req.params.id, req.params.applicationId);
    if (application) {
      res.status(200).json(application);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown error', error);
    }
    res.status(500).json({ message: 'Error fetching application', error });
  }
};

export const addApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await interviewService.addApplication(req.params.id, req.body);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error adding application', error });
  }
};

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await interviewService.getApplications(req.params.id);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await interviewService.updateApplicationStatus(req.params.id, req.params.applicationId, req.body.status);
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error });
  }
};