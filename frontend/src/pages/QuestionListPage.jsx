import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
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

  useEffect(() => {
    fetchQuestionPackages();
  }, [fetchQuestionPackages]);

  useEffect(() => {
    const pkg = questionPackages.find(pkg => pkg._id === id);
    setSelectedPackage(pkg);
  }, [questionPackages, id]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Eğer zaten submit ediliyorsa, işlemi durdur
    setIsSubmitting(true); // Butonu devre dışı bırak
    try {
      const order = selectedPackage.questions.length;
      await addQuestion(selectedPackage._id, { ...newQuestion, order });
      setNewQuestion({ text: '', minutes: 0, order: 0 });
      fetchQuestionPackages(); // Yeni veriyi almak için paketleri yeniden yükle
    } catch (error) {
      console.error('Failed to add question:', error);
    } finally {
      setIsSubmitting(false); // Butonu tekrar etkinleştir
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (editQuestionId) {
      try {
        await updateQuestion(selectedPackage._id, editQuestionId, editQuestion);
        setEditQuestionId(null);
        setEditQuestion({ text: '', minutes: 0, order: 0 });
        fetchQuestionPackages(); // Yeni veriyi almak için paketleri yeniden yükle
      } catch (error) {
        console.error('Failed to update question:', error);
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(selectedPackage._id, questionId);
        fetchQuestionPackages(); // Yeni veriyi almak için paketleri yeniden yükle
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const openEditQuestionForm = (question) => {
    setEditQuestionId(question._id);
    setEditQuestion(question);
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
        handleDeleteQuestion={handleDeleteQuestion}
      />
    );
  };

  if (!selectedPackage) return <div>Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1 className="text-2xl font-bold mb-4">Questions in {selectedPackage.title}</h1>
        <p className="mb-4">Total Questions: {selectedPackage.questions.length}</p>
        <ul>
          {selectedPackage.questions.map((question, index) => renderQuestion(question, index))}
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
      </div>
    </DndProvider>
  );
};

const Question = ({ question, index, moveQuestion, openEditQuestionForm, handleDeleteQuestion }) => {
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
    <li ref={ref} className={`p-2 bg-white mb-2 rounded shadow ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <span>{question.text || 'No text available'} - {question.minutes} minutes</span>
        <div>
          <button onClick={() => openEditQuestionForm(question)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
          <button onClick={() => handleDeleteQuestion(question._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        </div>
      </div>
    </li>
  );
};

export default QuestionListPage;