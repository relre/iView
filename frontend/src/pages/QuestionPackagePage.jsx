import { useState, useEffect } from 'react';
import useQuestionPackageStore from '../store/questionPackageStore';
import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon, PlusCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const QuestionPackagePage = () => {
  const { questionPackages, fetchQuestionPackages, addQuestionPackage, updateQuestionPackage, deleteQuestionPackage } = useQuestionPackageStore();
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  useEffect(() => {
    fetchQuestionPackages();
  }, [fetchQuestionPackages]);

  const handleAddTitle = async (e) => {
    e.preventDefault();
    await addQuestionPackage(newTitle);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleEditTitle = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateQuestionPackage(editId, editTitle);
      setEditId(null);
      setEditTitle('');
      setShowEditModal(false);
    }
  };

  const handleDeletePackage = async () => {
    if (packageToDelete) {
      await deleteQuestionPackage(packageToDelete);
      setPackageToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const openEditForm = (pkg) => {
    setEditId(pkg._id);
    setEditTitle(pkg.title);
    setShowEditModal(true);
  };

  const openDeleteModal = (pkgId) => {
    setPackageToDelete(pkgId);
    setShowDeleteModal(true);
  };

  const totalPackages = questionPackages.length;

  return (
    <div>
      <h1 className="text-4xl py-4 font-bold text-rtwgreen mb-4">Question Packages</h1>

      <div className='flex'>
        <div className="mb-4 p-4 rounded shadow w-1/5 flex items-center green-gradient">
          <div className="mr-4 flex items-center justify-center h-10 w-10 ">
            <ClipboardDocumentListIcon className="w-8 h-8 text-center text-rtwgreen" />
          </div>
          <div>
            <div className='text-2xl font-bold'>{totalPackages}</div>
            Total Packages
          </div>
        </div>
      </div>

      <div className='flex justify-end'>
        <button onClick={() => setShowAddModal(true)} className="bg-rtwgreen hover:bg-rtwgreendark text-white px-4 py-2 rounded mb-4 flex items-center">
          <PlusCircleIcon className="h-6 w-6 mr-2" /> Add New Package
        </button>
      </div>

      <table className="min-w-full border-separate border-spacing-y-2 border-spacing-x-0">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-start">Title</th>
            <th className="py-2 px-4 border-b text-end">Total Questions</th>
            <th className="py-2 px-4 border-b text-end">Total Time</th>
            <th className="py-2 px-4 border-b text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questionPackages.map((pkg) => {
            const totalSeconds = pkg.questions.reduce((sum, question) => sum + (question.minutes * 60) + question.seconds, 0);
            const totalMinutes = Math.floor(totalSeconds / 60);
            const remainingSeconds = totalSeconds % 60;
            const formattedTotalTime = `${totalMinutes}m ${remainingSeconds}s`;
            return (
              <tr key={pkg._id} className="p-2 bg-white mb-2 rounded shadow-sm hover:bg-rtwgreenligth">
                <td className="py-2 px-4 border-l border-t border-b rounded-l-lg">
                  <Link to={`/admin/questions-package/${pkg._id}`} className="text-rtwgreendark">
                    {pkg.title}
                  </Link>
                </td>
                <td className="py-2 px-4 border-t border-b text-end">
                  <button className="px-2 py-1 rounded text-[0.9rem] text-rtwgreendark bg-rtwgreenligth2 mr-2"><strong>{pkg.questions.length}</strong> questions</button>
                </td>
                <td className="py-2 px-4 border-t border-b text-end">
                  <button className="px-2 py-1 rounded text-[0.9rem] text-yellow-500 bg-yellow-100 mr-2"><strong>{formattedTotalTime}</strong></button>
                </td>
                <td className="py-2 px-4 border-r border-t border-b rounded-r-lg text-end flex justify-end space-x-2">
                  <button onClick={() => openEditForm(pkg)} className="px-2 py-1 rounded flex items-center mr-2 hover:text-rtwgreen"><PencilSquareIcon className="h-6 w-6 mr-1" />Edit</button>
                  <button onClick={() => openDeleteModal(pkg._id)} className="px-2 py-1 rounded flex items-center mr-2 hover:text-red-500"><TrashIcon className="h-6 w-6 mr-1" />Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/4">
            <h2 className="text-xl mb-4">Add New Package</h2>
            <form onSubmit={handleAddTitle}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="New Title"
                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent  "
                required
              />
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowAddModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 rounded-lg">Add Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Edit Package</h2>
            <form onSubmit={handleEditTitle}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Edit Title"
                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
                required
              />
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowEditModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 rounded-lg">Update Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <TrashIcon className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" />
            <h2 className="text-gray-500 mb-4">Are you sure you want to delete this package?</h2>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">No, cancel</button>
              <button onClick={handleDeletePackage} className="bg-red-600 hover:bg-red-700 text-sm text-white px-4 py-2 rounded-lg">Yes, I'm sure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPackagePage;