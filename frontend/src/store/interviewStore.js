import { create } from 'zustand';
import axios from 'axios';

const requestQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;
  const { link, interviewId, application, resolve, reject } = requestQueue.shift();

  try {
    console.log('Adding application:', application); // Debug log
    const response = await fetch(`https://iviewback.relre.dev/api/interview/${interviewId}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add application: ${errorText}`);
    }
    const newApplication = await response.json();
    console.log('New application ID:', newApplication.id || newApplication._id);
    const vidUrl = "https://tkk04oksokwwgwswgg84cg4w.5.253.143.162.sslip.io/uploads/RemoteTech/Emin-Okan/" + application.videoUrl;

    try {
      const transcribeResponse = await axios.post('https://iviewback.relre.dev:5000/transcribe', {
        id: newApplication.id || newApplication._id,
        interviewId: interviewId,
        url: vidUrl
      });

      const { datax } = transcribeResponse.data;
      console.log('Transcribe result:', datax); // Debug log

      await useInterviewStore.getState().updateApplicationDatax(interviewId, newApplication.id || newApplication._id, datax);
      resolve();
    } catch (error) {
      console.error('Error in transcribe request:', error);
      reject(error);
    }
  } catch (error) {
    console.error('Failed to add application:', error);
    reject(error);
  } finally {
    isProcessingQueue = false;
    processQueue();
  }
};


const useInterviewStore = create((set) => ({
  interviews: [],
  applications: [],
  application: null,
  totalApplications: 0,
  nonPendingCount: 0,
  url: '',
  transcribeResult: null,
  fetchInterviews: async () => {
    try {
      const response = await fetch('https://iviewback.relre.dev/api/interview');
      const interviews = await response.json();
  
      // Fetch applications for each interview and calculate totals
      const updatedInterviews = await Promise.all(interviews.map(async (interview) => {
        const appResponse = await fetch(`https://iviewback.relre.dev/api/interview/${interview._id}/applications`);
        const applications = await appResponse.json();
        const totalApplications = applications.length;
        const nonPendingCount = applications.filter(app => app.status === 'pending').length;
  
        return {
          ...interview,
          totalApplications,
          nonPendingCount,
        };
      }));
  
      set({ interviews: updatedInterviews });
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    }
  },
  fetchQuestionPackages: async () => {
    try {
      const response = await fetch('https://iviewback.relre.dev/api/question-packages');
      const data = await response.json();
      set({ questionPackages: data });
    } catch (error) {
      console.error('Failed to fetch question packages:', error);
    }
  },
   fetchInterviewQuestions: async (id) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}`);
      const data = await response.json();
      console.log('Fetched interview questions:', data); // Konsola yazdır
      const questions = data.questionPacks.flatMap(pack => pack.questions);
      set({ interviewQuestions: questions });
    } catch (error) {
      console.error('Failed to fetch interview questions:', error);
    }
  },
  addInterview: async (interview) => {
    try {
      const response = await fetch('https://iviewback.relre.dev/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interview),
      });
      if (!response.ok) {
        throw new Error('Failed to add interview');
      }
      const newInterview = await response.json();
      set((state) => ({
        interviews: [...state.interviews, newInterview],
      }));
    } catch (error) {
      console.error('Failed to add interview:', error);
    }
  },
  deleteInterview: async (id) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }
      set((state) => ({
        interviews: state.interviews.filter((interview) => interview._id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete interview:', error);
    }
  },
  addApplication: (link, interviewId, application) => {
    return new Promise((resolve, reject) => {
      requestQueue.push({ link, interviewId, application, resolve, reject });
      processQueue();
    });
  },


  updateApplicationDatax: async (id, applicationId, datax) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}/applications/${applicationId}/transcribe`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datax }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update application datax: ${errorText}`);
      }
      const updatedApplication = await response.json();
      set({ application: updatedApplication });
      console.log('Application datax updated:', updatedApplication); // Debug log
    } catch (error) {
      console.error('Failed to update application datax:', error);
    }
  },
  fetchApplications: async (link, interviewId) => {
    try {
      console.log(`Fetching applications for interview ID: ${interviewId}`);
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${interviewId}/applications`);
      const data = await response.json();
      console.log('Fetched applications ID and data', interviewId, data);
      const nonPendingCount = data.filter((application) => application.status === "pending").length;
      set({
        applications: data,
        totalApplications: data.length,
        nonPendingCount: nonPendingCount,
      });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  },
  fetchApplicationById: async (id, applicationId) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}/applications/${applicationId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch application by ID: ${errorText}`);
      }
      const data = await response.json();
      set({ application: data });
      console.log('Fetched application:', data); // Debug log
    } catch (error) {
      console.error('Failed to fetch application by ID:', error);
    }
  },
  fetchInterviewById: async (id) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interview');
      }
      const interview = await response.json();
      return interview;
    } catch (error) {
      console.error('Failed to fetch interview:', error);
      return null;
    }
  },
  fetchSecondInterviewById: async (id) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}`);
      const data = await response.json();
      console.log('Fetched interview:', data); // Log the fetched interview
      set({ interviewsec: data });
    } catch (error) {
      console.error('Failed to fetch interview:', error);
    }
  },
   updateInterview: async (id, updatedInterview) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInterview),
      });
      const data = await response.json();
      console.log('Updated interview:', data); // Log the updated interview
      set((state) => ({
        interviews: state.interviews.map((interview) =>
          interview._id === id ? data : interview
        ),
        interview: data,
      }));
    } catch (error) {
      console.error('Failed to update interview:', error);
    }
  },
  updateApplicationStatus: async (id, applicationId, status) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/interview/${id}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update application status: ${errorText}`);
      }
      const updatedApplication = await response.json();
      set({ application: updatedApplication });
      console.log('Application status updated:', updatedApplication); // Debug log
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  },
}));

export default useInterviewStore;