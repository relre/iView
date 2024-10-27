import Interview, { IInterview, IApplication } from '../models/Interview';

export const createInterview = async (interviewData: Partial<IInterview>): Promise<IInterview> => {
  const interview = new Interview(interviewData);
  return await interview.save();
};

export const getInterviews = async (): Promise<IInterview[]> => {
  return await Interview.find().populate('questionPacks');
};

export const getInterviewById = async (id: string): Promise<IInterview | null> => {
  return await Interview.findById(id).populate('questionPacks');
};

export const updateInterview = async (id: string, interviewData: Partial<IInterview>): Promise<IInterview | null> => {
  return await Interview.findByIdAndUpdate(id, interviewData, { new: true });
};

export const deleteInterview = async (id: string): Promise<IInterview | null> => {
  return await Interview.findByIdAndDelete(id);
};

export const addApplication = async (interviewId: string, applicationData: IApplication): Promise<IApplication> => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }
  interview.applications.push(applicationData);
  await interview.save();
  return applicationData;
};

export const getApplications = async (interviewId: string): Promise<IApplication[]> => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }
  return interview.applications;
};

export const updateApplicationStatus = async (interviewId: string, applicationId: string, status: 'pending' | 'approved' | 'rejected'): Promise<IApplication | null> => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }
  const application = interview.applications.find(app => app._id.toString() === applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  application.status = status;
  await interview.save();
  return application;
};

export const getApplicationById = async (interviewId: string, applicationId: string): Promise<IApplication | null> => {
  console.log(`Fetching interview with ID: ${interviewId}`);
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    console.log('Interview not found');
    throw new Error('Interview not found');
  }
  console.log(`Interview found: ${interview}`);
  const application = interview.applications.find(app => app._id.toString() === applicationId);
  if (!application) {
    console.log('Application not found');
    throw new Error('Application not found');
  }
  console.log(`Application found: ${application}`);
  return application;
};