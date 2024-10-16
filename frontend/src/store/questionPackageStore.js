import { create } from 'zustand';

const useQuestionPackageStore = create((set) => ({
  questionPackages: [],
  fetchQuestionPackages: async () => {
    const response = await fetch('http://localhost:5555/api/question-packages', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    set({ questionPackages: data });
  },
  addQuestionPackage: async (title) => {
    const response = await fetch('http://localhost:5555/api/question-packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, questions: [] })
    });
    const newPackage = await response.json();
    set((state) => ({ questionPackages: [...state.questionPackages, newPackage] }));
  },
  updateQuestionPackage: async (id, title) => {
    const response = await fetch(`http://localhost:5555/api/question-packages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title })
    });
    const updatedPackage = await response.json();
    set((state) => ({
      questionPackages: state.questionPackages.map(pkg => pkg._id === id ? updatedPackage : pkg)
    }));
  },
  deleteQuestionPackage: async (id) => {
    await fetch(`http://localhost:5555/api/question-packages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    set((state) => ({
      questionPackages: state.questionPackages.filter(pkg => pkg._id !== id)
    }));
  },
  addQuestion: async (packageId, question) => {
    const response = await fetch(`http://localhost:5555/api/question-packages/${packageId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(question)
    });
    if (!response.ok) {
      throw new Error('Failed to add question');
    }
    const addedQuestion = await response.json();
    set((state) => ({
      questionPackages: state.questionPackages.map(pkg => pkg._id === packageId ? { ...pkg, questions: [...pkg.questions, addedQuestion] } : pkg)
    }));
    return addedQuestion;
  },
  updateQuestion: async (packageId, questionId, question) => {
    const response = await fetch(`http://localhost:5555/api/question-packages/${packageId}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(question)
    });
    if (!response.ok) {
      throw new Error('Failed to update question');
    }
    const updatedQuestion = await response.json();
    set((state) => ({
      questionPackages: state.questionPackages.map(pkg => pkg._id === packageId ? {
        ...pkg,
        questions: pkg.questions.map(q => q._id === questionId ? updatedQuestion : q)
      } : pkg)
    }));
    return updatedQuestion;
  },
  deleteQuestion: async (packageId, questionId) => {
    const response = await fetch(`http://localhost:5555/api/question-packages/${packageId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      set((state) => ({
        questionPackages: state.questionPackages.map((pkg) =>
          pkg._id === packageId
            ? {
                ...pkg,
                questions: pkg.questions.filter((q) => q._id !== questionId),
              }
            : pkg
        ),
      }));
    } else {
      console.error('Failed to delete question');
    }
  },
}));

export default useQuestionPackageStore;