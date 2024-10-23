import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import useQuestionPackageStore from '../store/questionPackageStore';

const QuestionListPage = () => {
  const { id } = useParams();
  const { questionPackages, fetchQuestionPackages, addQuestion, updateQuestion, deleteQuestion } = useQuestionPackageStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', minutes: 0, order: 0 });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({ text: '', minutes: 0, order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    fetchQuestionPackages();
  }, [fetchQuestionPackages]);

  useEffect(() => {
    const pkg = questionPackages.find(pkg => pkg._id === id);
    setSelectedPackage(pkg);
  }, [questionPackages, id]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const order = selectedPackage.questions.length;
      await addQuestion(selectedPackage._id, { ...newQuestion, order });
      setNewQuestion({ text: '', minutes: 0, order: 0 });
      fetchQuestionPackages();
    } catch (error) {
      console.error('Failed to add question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (editQuestionId) {
      try {
        await updateQuestion(selectedPackage._id, editQuestionId, editQuestion);
        setEditQuestionId(null);
        setEditQuestion({ text: '', minutes: 0, order: 0 });
        fetchQuestionPackages();
      } catch (error) {
        console.error('Failed to update question:', error);
      }
    }
  };

  const handleDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteQuestion(selectedPackage._id, questionToDelete);
        fetchQuestionPackages();
      } catch (error) {
        console.error('Failed to delete question:', error);
      } finally {
        setShowModal(false);
        setQuestionToDelete(null);
      }
    }
  };

  const openEditQuestionForm = (question) => {
    setEditQuestionId(question._id);
    setEditQuestion(question);
  };

  const openDeleteModal = (questionId) => {
    setQuestionToDelete(questionId);
    setShowModal(true);
  };

  const moveQuestion = useCallback((dragIndex, hoverIndex) => {
    const draggedQuestion = selectedPackage.questions[dragIndex];
    setSelectedPackage((prevPackage) => ({
      ...prevPackage,
      questions: update(prevPackage.questions, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, draggedQuestion],
        ],
      }),
    }));
  }, [selectedPackage]);

  const renderQuestion = (question, index) => {
    return (
      <Question
        key={question._id}
        index={index}
        question={question}
        moveQuestion={moveQuestion}
        openEditQuestionForm={openEditQuestionForm}
        openDeleteModal={openDeleteModal}
      />
    );
  };

  if (!selectedPackage) return <div>Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1 className="text-4xl py-4 font-bold text-rtwgreen mb-4">Questions in {selectedPackage.title}</h1>
        <p className="mb-4">Total Questions: {selectedPackage.questions.length}</p>
        <table className="min-w-full border-separate border-spacing-y-2 border-spacing-x-0">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-start">Question Text</th>
              <th className="py-2 px-4 border-b text-end">Minutes</th>
              <th className="py-2 px-4 border-b text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedPackage.questions.map((question, index) => renderQuestion(question, index))}
          </tbody>
        </table>
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
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Question'}
          </button>
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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Question</button>
          </form>
        )}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl mb-4">Are you sure you want to delete this question?</h2>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">No</button>
                <button onClick={handleDeleteQuestion} className="bg-red-500 text-white px-4 py-2 rounded">Yes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

const Question = ({ question, index, moveQuestion, openEditQuestionForm, openDeleteModal }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: 'QUESTION',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'QUESTION',
    item: { type: 'QUESTION', id: question._id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr ref={ref} className={`p-2 bg-white mb-2 rounded shadow-sm hover:bg-rtwgreenligth ${isDragging ? 'opacity-50' : ''}`}>
      <td className="py-2 px-4 border-l border-t border-b rounded-l-lg">{question.text || 'No text available'}</td>
      <td className="py-2 px-4 border-t border-b text-end">{question.minutes} minutes</td>
      <td className="py-2 px-4 border-r border-t border-b rounded-r-lg text-end flex justify-end space-x-2">
        <button onClick={() => openEditQuestionForm(question)} className="px-2 py-1 rounded flex items-center mr-2 hover:text-rtwgreen"><PencilSquareIcon className="h-6 w-6 mr-1" />Edit</button>
        <button onClick={() => openDeleteModal(question._id)} className="px-2 py-1 rounded flex items-center mr-2 hover:text-red-500"><TrashIcon className="h-6 w-6 mr-1" />Delete</button>
      </td>
    </tr>
  );
};

export default QuestionListPage;