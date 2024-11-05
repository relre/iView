import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { PencilSquareIcon, TrashIcon, ClockIcon, QuestionMarkCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import useQuestionPackageStore from '../store/questionPackageStore';

const QuestionListPage = () => {
  const { id } = useParams();
  const { questionPackages, fetchQuestionPackages, addQuestion, updateQuestion, deleteQuestion } = useQuestionPackageStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', minutes: 0, seconds: 0, order: 0 });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({ text: '', minutes: 0, seconds: 0, order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
      const seconds = newQuestion.seconds > 59 ? 59 : newQuestion.seconds;
      await addQuestion(selectedPackage._id, { ...newQuestion, seconds, order });
      setNewQuestion({ text: '', minutes: 0, seconds: 0, order: 0 });
      fetchQuestionPackages();
    } catch (error) {
      console.error('Failed to add question:', error);
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (editQuestionId) {
      try {
        const seconds = editQuestion.seconds > 59 ? 59 : editQuestion.seconds;
        await updateQuestion(selectedPackage._id, editQuestionId, { ...editQuestion, seconds });
        setEditQuestionId(null);
        setEditQuestion({ text: '', minutes: 0, seconds: 0, order: 0 });
        fetchQuestionPackages();
      } catch (error) {
        console.error('Failed to update question:', error);
      } finally {
        setShowEditModal(false);
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
        setShowDeleteModal(false);
        setQuestionToDelete(null);
      }
    }
  };

  const openEditQuestionForm = (question) => {
    setEditQuestionId(question._id);
    setEditQuestion(question);
    setShowEditModal(true);
  };

  const openDeleteModal = (questionId) => {
    setQuestionToDelete(questionId);
    setShowDeleteModal(true);
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

  const totalSeconds = selectedPackage.questions.reduce((sum, question) => sum + (question.minutes * 60) + question.seconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const formattedTotalTime = `${totalMinutes}m ${remainingSeconds}s`; // Format string oluşturma
  const totalQuestions = selectedPackage.questions.length;

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1 className="text-4xl py-4 font-bold text-rtwgreen mb-4">Questions in {selectedPackage.title}</h1>
       
        <div className='flex space-x-5'>
          <div className="mb-4 p-4 rounded shadow w-1/5 flex items-center green-gradient">
            <div className="mr-4 flex items-center justify-center h-10 w-10 ">
              <QuestionMarkCircleIcon className="w-8 h-8 text-center text-rtwgreen " />
            </div>
            <div>
              <div className='text-2xl font-bold'>{totalQuestions}</div>
              Total Questions
            </div>
          </div>

          <div className="mb-4 p-4 rounded  shadow w-1/5 flex items-center yellow-gradient">
            <div className="mr-4 flex items-center justify-center h-10 w-10">
              <ClockIcon className="w-8 h-8 text-center text-rtwyellow " />
            </div>
            <div>
              <div className='text-2xl font-bold'>{formattedTotalTime}</div>
              Total Time
            </div>
          </div>
        </div>

        <div className='flex justify-end'>
          <button onClick={() => setShowAddModal(true)} className="bg-rtwgreen hover:bg-rtwgreendark text-white px-4 py-2 rounded mb-4 flex items-center">
            <PlusCircleIcon className="h-6 w-6 mr-2" /> Add New Question
          </button>
        </div>

        <table className="min-w-full border-separate border-spacing-y-2 border-spacing-x-0">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-start">
                <div className="flex items-center justify-start space-x-1">
                  Questions
                </div>
              </th>
              <th className="py-2 px-4 border-b text-end">
                <div className="flex items-center justify-end space-x-1 mr-3">
                  
                  Minutes
                </div>
              </th>
              <th className="py-2 px-4 border-b text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedPackage.questions.map((question, index) => renderQuestion(question, index))}
          </tbody>
        </table>

        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl mb-4">Add New Question</h2>
              <form onSubmit={handleAddQuestion}>
                <input
                  type="text"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="New Question Text"
                  className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={newQuestion.minutes}
                  onChange={(e) => setNewQuestion({ ...newQuestion, minutes: parseInt(e.target.value) })}
                  placeholder="Minutes"
                  className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={newQuestion.seconds}
                  onChange={(e) => {
                    const seconds = parseInt(e.target.value);
                    setNewQuestion({ ...newQuestion, seconds: seconds > 59 ? 59 : seconds });
                  }}
                  placeholder="Seconds"
                  className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                  required
                  min="0"
                  max="59"
                />
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setShowAddModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">Cancel</button>
                  <button type="submit" className="bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 rounded-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl mb-4">Edit Question</h2>
              <form onSubmit={handleEditQuestion}>
                <input
                  type="text"
                  value={editQuestion.text || ''}
                  onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                  placeholder="Edit Question Text"
                  className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={editQuestion.minutes || 0}
                  onChange={(e) => setEditQuestion({ ...editQuestion, minutes: parseInt(e.target.value) })}
                  placeholder="Minutes"
                  className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={editQuestion.seconds || 0}
                  onChange={(e) => {
                    const seconds = parseInt(e.target.value);
                    setEditQuestion({ ...editQuestion, seconds: seconds > 59 ? 59 : seconds });
                  }}
                  placeholder="Seconds"
                  className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                  required
                  min="0"
                  max="59"
                />
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setShowEditModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">Cancel</button>
                  <button type="submit" className="bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 rounded-lg">Update Question</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <TrashIcon className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" />
              <h2 className="text-gray-500 mb-4">Are you sure you want to delete this question?</h2>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">No, cancel</button>
                <button onClick={handleDeleteQuestion} className="bg-red-600 hover:bg-red-700 text-sm text-white px-4 py-2 rounded-lg">Yes, I'm sure</button>
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
      <td className="py-2 px-4 border-l border-t border-b rounded-l-lg">
        {question.text || 'No text available'}
      </td>
      <td className="py-2 px-4 border-t border-b text-end">
        <button className="px-2 py-1 rounded text-[0.9rem] text-yellow-500 bg-yellow-100 mr-2"><strong>{question.minutes}</strong> minutes <strong>{question.seconds}</strong> seconds</button>
      </td>
      <td className="py-2 px-4 border-r border-t border-b rounded-r-lg text-end flex justify-end space-x-2">
        <button onClick={() => openEditQuestionForm(question)} className="px-2 py-1 rounded flex items-center mr-2 hover:text-rtwgreen"><PencilSquareIcon className="h-6 w-6 mr-1" />Edit</button>
        <button onClick={() => openDeleteModal(question._id)} className="px-2 py-1 rounded flex items-center mr-2 hover:text-red-500"><TrashIcon className="h-6 w-6 mr-1" />Delete</button>
      </td>
    </tr>
  );
};

export default QuestionListPage;