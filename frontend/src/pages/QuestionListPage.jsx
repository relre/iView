import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useQuestionPackageStore from '../store/questionPackageStore';

const QuestionListPage = () => {
  const { id } = useParams();
  const { questionPackages, fetchQuestionPackages, addQuestion, updateQuestion, deleteQuestion } = useQuestionPackageStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', minutes: 0, order: 0 });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({ text: '', minutes: 0, order: 0 });

  useEffect(() => {
    fetchQuestionPackages();
  }, [fetchQuestionPackages]);

  useEffect(() => {
    const pkg = questionPackages.find(pkg => pkg._id === id);
    setSelectedPackage(pkg);
  }, [questionPackages, id]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const addedQuestion = await addQuestion(selectedPackage._id, newQuestion);
      if (addedQuestion && addedQuestion._id) {
        setNewQuestion({ text: '', minutes: 0, order: 0 });
        setSelectedPackage({
          ...selectedPackage,
          questions: [...selectedPackage.questions, addedQuestion]
        });
      } else {
        console.error('Failed to add question: Invalid response');
      }
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (editQuestionId) {
      try {
        const updatedQuestion = await updateQuestion(selectedPackage._id, editQuestionId, editQuestion);
        if (updatedQuestion && updatedQuestion._id) {
          setEditQuestionId(null);
          setEditQuestion({ text: '', minutes: 0, order: 0 });
          setSelectedPackage({
            ...selectedPackage,
            questions: selectedPackage.questions.map(q => q._id === editQuestionId ? updatedQuestion : q)
          });
        } else {
          console.error('Failed to update question: Invalid response');
        }
      } catch (error) {
        console.error('Failed to update question:', error);
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(selectedPackage._id, questionId);
        setSelectedPackage({
          ...selectedPackage,
          questions: selectedPackage.questions.filter(q => q._id !== questionId)
        });
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const openEditQuestionForm = (question) => {
    setEditQuestionId(question._id);
    setEditQuestion(question);
  };

  if (!selectedPackage) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Questions in {selectedPackage.title}</h1>
      <p className="mb-4">Total Questions: {selectedPackage.questions.length}</p>
      <ul>
        {selectedPackage.questions.map((question) => (
          <li key={question._id} className="p-2 bg-white mb-2 rounded shadow">
            <div className="flex justify-between items-center">
              <span>{question.text || 'No text available'}</span>
              <div>
                <button onClick={() => openEditQuestionForm(question)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                <button onClick={() => handleDeleteQuestion(question._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddQuestion} className="mt-4">
        <input
          type="text"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          placeholder="New Question Text"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="number"
          value={newQuestion.minutes}
          onChange={(e) => setNewQuestion({ ...newQuestion, minutes: parseInt(e.target.value) })}
          placeholder="Minutes"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="number"
          value={newQuestion.order}
          onChange={(e) => setNewQuestion({ ...newQuestion, order: parseInt(e.target.value) })}
          placeholder="Order"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Question</button>
      </form>
      {editQuestionId && (
        <form onSubmit={handleEditQuestion} className="mt-4">
          <input
            type="text"
            value={editQuestion.text || ''}
            onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
            placeholder="Edit Question Text"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <input
            type="number"
            value={editQuestion.minutes || 0}
            onChange={(e) => setEditQuestion({ ...editQuestion, minutes: parseInt(e.target.value) })}
            placeholder="Minutes"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <input
            type="number"
            value={editQuestion.order || 0}
            onChange={(e) => setEditQuestion({ ...editQuestion, order: parseInt(e.target.value) })}
            placeholder="Order"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Question</button>
        </form>
      )}
    </div>
  );
};

export default QuestionListPage;