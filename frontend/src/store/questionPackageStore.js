import { create } from 'zustand';

const useQuestionPackageStore = create((set) => ({
  questionPackages: [],
  fetchQuestionPackages: async () => {
    try {
      const response = await fetch('https://iviewback.relre.dev/api/question-packages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch question packages');
      }
      const data = await response.json();
      set({ questionPackages: data });
    } catch (error) {
      // console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
  addQuestionPackage: async (title) => {
    try {
      const response = await fetch('https://iviewback.relre.dev/api/question-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, questions: [] })
      });
      if (!response.ok) {
        throw new Error('Failed to create question package');
      }
      const newPackage = await response.json();
      set((state) => ({ questionPackages: [...state.questionPackages, newPackage] }));
    } catch (error) {
     //  console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
  updateQuestionPackage: async (id, title) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/question-packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title })
      });
      if (!response.ok) {
        throw new Error('Failed to update question package');
      }
      const updatedPackage = await response.json();
      set((state) => ({
        questionPackages: state.questionPackages.map(pkg => pkg._id === id ? updatedPackage : pkg)
      }));
    } catch (error) {
     //  console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
  deleteQuestionPackage: async (id) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/question-packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete question package');
      }
      set((state) => ({
        questionPackages: state.questionPackages.filter(pkg => pkg._id !== id)
      }));
    } catch (error) {
    //   console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
  addQuestion: async (packageId, question) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/question-packages/${packageId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(question)
      });
     //  console.log('API response:', response); // Debugging
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      const questionPackage = await response.json();
      const addedQuestion = questionPackage.questions[questionPackage.questions.length - 1]; // Son eklenen soruyu al
    //   console.log('Added question:', addedQuestion); // Debugging
      set((state) => ({
        questionPackages: state.questionPackages.map(pkg => pkg._id === packageId ? { ...pkg, questions: [...pkg.questions, addedQuestion] } : pkg)
      }));
      return addedQuestion;
    } catch (error) {
     //  console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
  updateQuestion: async (packageId, questionId, question) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/question-packages/${packageId}/questions/${questionId}`, {
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
    } catch (error) {
     //  console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
  deleteQuestion: async (packageId, questionId) => {
    try {
      const response = await fetch(`https://iviewback.relre.dev/api/question-packages/${packageId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
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
    } catch (error) {
     //  console.error(error.message);
      // Optionally, you can set an error state here
    }
  },
}));

const updateQuestionOrder = async (packageId, questions) => {
  try {
    await fetch(`https://iviewback.relre.dev/api/questionPackages/${packageId}/questions/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions }),
    });
  } catch (error) {
   //  console.error('Soru sırası güncellenemedi:', error);
  }
};

export default useQuestionPackageStore;