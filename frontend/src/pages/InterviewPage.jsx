import { useState, useEffect } from 'react';
import Select from 'react-select';
import useInterviewStore from '../store/interviewStore';
import { PlusCircleIcon, TrashIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';

const InterviewPage = () => {
  const { interviews, questionPackages, fetchInterviews, fetchQuestionPackages, addInterview, deleteInterview } = useInterviewStore();
  const [newInterview, setNewInterview] = useState({
    title: '',
    isPublished: false,
    link: '',
    expireDate: '',
    questions: [],
    questionPacks: [],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);

  useEffect(() => {
    fetchInterviews();
    fetchQuestionPackages();
  }, [fetchInterviews, fetchQuestionPackages]);

  const handleAddInterview = async (e) => {
    e.preventDefault();
    try {
      await addInterview(newInterview);
      setNewInterview({
        title: '',
        isPublished: false,
        link: '',
        expireDate: '',
        questions: [],
        questionPacks: [],
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding interview:", error);
    }
  };

  const handleDeleteInterview = async () => {
    try {
      if (interviewToDelete) {
        await deleteInterview(interviewToDelete);
        setInterviewToDelete(null);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const link = generateLink(title);
    setNewInterview({ ...newInterview, title, link });
  };

  const generateLink = (title) => {
    const turkishMap = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    return title
      .split('')
      .map(char => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleQuestionPackChange = (selectedOptions) => {
    const selectedPackIds = selectedOptions.map(option => option.value);
    setNewInterview({ ...newInterview, questionPacks: selectedPackIds });
  };

  const questionPackageOptions = questionPackages ? questionPackages.map(pack => ({
    value: pack._id,
    label: pack.title
  })) : [];

  return (
    <div>
      <h1 className="text-4xl py-4 font-bold text-rtwgreen mb-4">Interviews</h1>
      <div className='flex justify-end'>
        <button onClick={() => setShowAddModal(true)} className="bg-rtwgreen hover:bg-rtwgreendark text-white px-4 py-2 rounded mb-4 flex items-center">
          <PlusCircleIcon className="h-6 w-6 mr-2 " /> Add New Interview
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">

        

        {interviews.map((interview) => (
          <div key={interview._id} className="p-4 bg-white mb-2 rounded shadow justify-between">
           <div className='flex justify-end'>
            
           
            <TrashIcon className='w-4 h-4 hover:text-red-500'  onClick={() => { setInterviewToDelete(interview._id); setShowDeleteModal(true); }}/> 

            </div>
            <div>
              
              <span className="text-lg font-bold text-rtwgreendark border-b ">
                <a href={`/admin/interview/${interview.link}/${interview._id}`}>{interview.title}</a>
              </span> 

              <div className='flex text-sm items-center mt-2 mb-4'> <LinkIcon className='w-4 h-4 mr-1' />
            <a href={`/interview/${interview.link}/${interview._id}`} target="_blank" rel="noopener noreferrer">
           Apply Link</a>
            </div>
              
           
            </div>
            <span className='text-sm'>Candidates:</span>
<div className='flex space-x-2 mt-2'>
            <div className="mb-2 p-2 rounded shadow w-1/4 flex items-center bg-rtwgreenligth2">
            <div className="mr-2 flex items-center justify-center">
            
            </div>
            <div>
              <div className='text-2xl font-bold'>19</div>
              Total
            </div>
          </div>
          <div className="mb-2 p-2 rounded shadow w-1/4 flex items-center bg-rtwgreenligth">
            <div className="mr-2 flex items-center justify-center">
            
            </div>
            <div>
              <div className='text-2xl font-bold'>13</div>
              On Hold
            </div>
          </div>
</div>
                <div className='flex justify-between border-t mt-2'>
            
           
            <span className='text-sm mt-2'>Published: {interview.isPublished ? 'Yes' : 'No'}</span>
            <span className='text-sm mt-2'><a href={`/admin/interview/${interview.link}/${interview._id}`}> Details  &gt;</a></span>
              
            </div>
           
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/12">
            <h2 className="text-xl mb-4">Add New Interview</h2>
            <form onSubmit={handleAddInterview}>
              <input
                type="text"
                value={newInterview.title}
                onChange={handleTitleChange}
                placeholder="Title"
                className="w-full p-2 border border-gray-300 rounded mb-2"
                required
              />

<div className="mb-4">
                <h2 className="text-lg mb-2 mt-2">Question Packages</h2>
                <Select
                  isMulti
                  value={questionPackageOptions.filter(option => newInterview.questionPacks.includes(option.value))}
                  onChange={handleQuestionPackChange}
                  options={questionPackageOptions}
                  placeholder="Search Question Packages"
                  className="w-full mb-2"
                />
              </div>


              
              
              <h2 className="text-lg mb-2 mt-2">Expire Date</h2>
              <input
                type="date"
                value={newInterview.expireDate}
                onChange={(e) => setNewInterview({ ...newInterview, expireDate: e.target.value })}
                placeholder="Expire Date"
                className="w-full p-2 border border-gray-300 rounded mb-2"
                required
              />
  <label className="flex items-center cursor-pointer mt-2">
      <div className="relative">
        <input
          type="checkbox"
          checked={newInterview.isPublished}
          onChange={(e) => setNewInterview({ ...newInterview, isPublished: e.target.checked })}
          className="appearance-none h-5 w-5 border border-gray-300 rounded checked:bg-rtwgreen focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:ring-offset-2"
        />
      
        {newInterview.isPublished && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckIcon className="h-4 w-4 mb-2 text-white" />
          </div>
        )}
      </div>
      <span className="ml-2 mb-2">Publish now</span>
    </label>
            
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowAddModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 rounded-lg">Add Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <TrashIcon className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" />
            <h2 className="text-gray-500 mb-4">Are you sure you want to delete this interview?</h2>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="bg-white hover:bg-gray-100 text-sm text-black border px-4 py-2 rounded-lg">No, cancel</button>
              <button onClick={handleDeleteInterview} className="bg-red-600 hover:bg-red-700 text-sm text-white px-4 py-2 rounded-lg">Yes, I'm sure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;