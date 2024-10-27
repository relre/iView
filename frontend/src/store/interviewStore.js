import { create } from 'zustand';

const useInterviewStore = create((set) => ({
  interviews: [],
  applications: [],
  fetchInterviews: async () => {
    try {
      const response = await fetch('http://localhost:5555/api/interview');
      const data = await response.json();
      set({ interviews: data });
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    }
  },
  fetchQuestionPackages: async () => {
    try {
      const response = await fetch('http://localhost:5555/api/question-packages');
      const data = await response.json();
      set({ questionPackages: data });
    } catch (error) {
      console.error('Failed to fetch question packages:', error);
    }
  },
  addInterview: async (interview) => {
    try {
      const response = await fetch('http://localhost:5555/api/interview', {
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
      const response = await fetch(`http://localhost:5555/api/interview/${id}`, {
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
  addApplication: async (link, interviewId, application) => {
    try {
      console.log('Adding application:', application); // Debug log
      const response = await fetch(`http://localhost:5555/api/interview/${interviewId}/applications`, {
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
      set((state) => ({
        applications: [...state.applications, newApplication],
      }));
    } catch (error) {
      console.error('Failed to add application:', error);
    }
  },
  fetchApplications: async (link, interviewId) => {
    try {
      console.log(`Fetching applications for interview ID: ${interviewId}`); // Debug log
      const response = await fetch(`http://localhost:5555/api/interview/${interviewId}/applications`);
      const data = await response.json();
      console.log('Fetched applications:', data); // Debug log
      set({ applications: data });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  },
}));

export default useInterviewStore;