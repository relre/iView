import { useState, useEffect } from 'react';
import useQuestionPackageStore from '../store/questionPackageStore';
import { Link } from 'react-router-dom';

const QuestionPackagePage = () => {
  const { questionPackages, fetchQuestionPackages, addQuestionPackage, updateQuestionPackage, deleteQuestionPackage } = useQuestionPackageStore();
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchQuestionPackages();
  }, [fetchQuestionPackages]);

  const handleAddTitle = async (e) => {
    e.preventDefault();
    await addQuestionPackage(newTitle);
    setNewTitle('');
  };

  const handleEditTitle = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateQuestionPackage(editId, editTitle);
      setEditId(null);
      setEditTitle('');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question package?')) {
      await deleteQuestionPackage(id);
    }
  };

  const openEditForm = (pkg) => {
    setEditId(pkg._id);
    setEditTitle(pkg.title);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Question Packages</h1>
      <form onSubmit={handleAddTitle} className="mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New Title"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Title</button>
      </form>
      <ul>
        {questionPackages.map((pkg) => (
          <li key={pkg._id} className="p-2 bg-white mb-2 rounded shadow">
            <div className="flex justify-between items-center">
              <Link to={`/admin/questions-package/${pkg._id}`} className="text-blue-500">{pkg.title}</Link>
              <div>
                <button onClick={() => openEditForm(pkg)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                <button onClick={() => handleDelete(pkg._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editId && (
        <form onSubmit={handleEditTitle} className="mt-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Edit Title"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Title</button>
        </form>
      )}
    </div>
  );
};

export default QuestionPackagePage;