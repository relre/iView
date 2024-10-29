import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import { ClockIcon, ClipboardDocumentCheckIcon, CalendarIcon, CheckIcon, XMarkIcon, QuestionMarkCircleIcon  } from '@heroicons/react/24/outline';

const ApplicationsPage = () => {
  const { link, id } = useParams();
  const { applications = [], fetchApplications, totalApplications, nonPendingCount, interviewsec, fetchSecondInterviewById, interviewQuestions = [], fetchInterviewQuestions, updateInterview } = useInterviewStore();
  const [newExpireDate, setNewExpireDate] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications(link, id);
    fetchSecondInterviewById(id);
    fetchInterviewQuestions(id);
  }, [fetchApplications, fetchSecondInterviewById, fetchInterviewQuestions, link, id]);

  useEffect(() => {
    console.log('Interview:', interviewsec);
    if (interviewsec) {
      setNewExpireDate(new Date(interviewsec.expireDate).toISOString().split('T')[0]);
    }
  }, [interviewsec]);

  const handleExpireDateChange = (e) => {
    setNewExpireDate(e.target.value);
    setShowSaveButton(true);
    setSaveButtonText('Save');
  };

  const handleExpireDateSave = async () => {
    await updateInterview(id, { expireDate: newExpireDate });
    setShowSaveButton(false);
    setSaveButtonText('Saved');
    fetchSecondInterviewById(id); // Refresh the interview data
  };

  const handleStatusToggle = async () => {
    const newStatus = !interviewsec.isPublished;
    await updateInterview(id, { isPublished: newStatus });
    fetchSecondInterviewById(id); // Refresh the interview data
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const filteredApplications = applications.filter((application) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      application.name.toLowerCase().includes(query) ||
      application.surname.toLowerCase().includes(query) ||
      application.email.toLowerCase().includes(query) ||
      application.phone.toLowerCase().includes(query);

    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1 className='text-4xl py-4 font-bold mb-4'>
        
        {interviewsec && (
          <span className="text-4xl py-4 font-bold text-rtwgreen mb-4">
            {interviewsec.title}
          </span>
        )}
        {' '}Interview
      </h1>
      

      {interviewsec && (
        <>
 <h2 className='text-xl mb-4 w-1/5 font-bold text-rtwgreendark border-b border-rtwgreendark pl-5 p-2 mt-5'>Interview Details</h2>
    <div className='flex space-x-5'>
        <div  onClick={handleStatusToggle} className={`mb-4 p-4 rounded shadow  ${interviewsec.isPublished ? 'active-gradient' : 'passive-gradient'} cursor-pointer w-1/4 flex items-center`}>
          <div className="mr-4 flex items-center justify-center h-10 w-10 ">
          {interviewsec.isPublished ? (
    <CheckIcon className="w-8 h-8 text-center text-green-400" />
) : (
    <XMarkIcon className="w-8 h-8 text-center text-red-400" />
)}
          
          </div>
          <div>
            <div className='text-xl mb-1 font-bold'>Status</div>
            {interviewsec.isPublished ? 'Active' : 'Passive'}
          </div>
        </div>
        <div className="mb-4 p-4 rounded shadow w-1/4 flex items-center gray-gradient">
          <div className="mr-4 flex items-center justify-center h-10 w-10">
            <CalendarIcon className="w-8 h-8 text-center text-gray-500 " />
          </div>
          <div>
            <div className='text-xl mb-2 font-bold'>Expire Date</div>
            <input
              type="date"
              value={newExpireDate}
              onChange={handleExpireDateChange}
              className="border border-gray-300 rounded p-1"
            />{showSaveButton && (
              <button onClick={handleExpireDateSave} className="bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 ml-2 rounded-lg">
                {saveButtonText}
              </button>
            )}
          </div>
        </div>
        <div className='flex items-center justify-center'><button onClick={handleModalOpen} className="flex px-4 py-2 rounded mb-4 mr-2 items-center border-2 ">
           <QuestionMarkCircleIcon className="w-6 h-6 text-center mr-2 " />
            Show Questions
          </button></div>
      </div>
     

          <h2 className='text-xl mb-4 w-1/5 font-bold text-rtwgreendark border-b border-rtwgreendark pl-5 p-2 mt-5'>Applications</h2>
      <div className='flex space-x-5'>
        <div className="mb-4 p-4 rounded shadow w-1/4 flex items-center green-gradient">
          <div className="mr-4 flex items-center justify-center h-10 w-10 ">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-center text-rtwgreen " />
          </div>
          <div>
            <div className='text-2xl font-bold '>{totalApplications}</div>
            Total Applications
          </div>
        </div>
        <div className="mb-4 p-4 rounded shadow w-1/4 flex items-center yellow-gradient">
          <div className="mr-4 flex items-center justify-center h-10 w-10">
            <ClockIcon className="w-8 h-8 text-center text-rtwyellow " />
          </div>
          <div>
            <div className='text-2xl font-bold'>{nonPendingCount}</div>
            Pending Applications
          </div>
        </div>
      </div>

        
       
        </>
      )}


      <div className="mb-4 mt-4 w-1/2">
        <input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:border-transparent"
        />
        <div className="mt-2">
          <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 rounded mb-4 mr-2 items-center ${filterStatus === 'all' ? 'bg-rtwgreen text-white ' : 'bg-gray-200'}`}>
            All
          </button>
          <button onClick={() => handleFilterChange('approved')} className={`px-4 py-2 rounded mb-4 mr-2 items-center ${filterStatus === 'approved' ? 'bg-rtwgreendark text-white' : 'bg-gray-200'}`}>
            Approved
          </button>
          <button onClick={() => handleFilterChange('rejected')} className={`px-4 py-2 rounded mb-4 mr-2 items-center ${filterStatus === 'rejected' ? 'bg-red-400 text-white' : 'bg-gray-200'}`}>
            Rejected
          </button>
          <button onClick={() => handleFilterChange('pending')} className={`px-4 py-2 rounded mb-4 mr-2 items-center ${filterStatus === 'pending' ? 'bg-rtwyellow text-black' : 'bg-gray-200'}`}>
            Pending
          </button>
        </div>
      </div>
      <ul>
        {filteredApplications.map((application) => (
          <li key={application._id} className="mb-2 p-2 border border-gray-300 rounded">
            <Link to={`/admin/interview/${id}/applications/${application._id}`}>
              <p><strong>Name:</strong> {application.name}    {application.length}</p>
              <p><strong>Surname:</strong> {application.surname}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Phone:</strong> {application.phone}</p>
              <p><strong>Status:</strong> {application.status}</p>
            </Link>
          </li>
        ))}
      </ul>
     
      {isModalOpen && (
        <Modal onClose={handleModalClose}>
          <h2 className='text-2xl py-4 font-bold mb-4 text-rtwgreen'>Interview Questions</h2>
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-start">Question</th>
                  <th className="py-2 px-4 border-b">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {interviewQuestions.length > 0 ? (
                  interviewQuestions.map((question, index) => (
                    <tr key={index} className='p-2 bg-white mb-2 rounded shadow-sm hover:bg-rtwgreenligth'>
                      <td className="py-2 px-4 border-l border-t border-b rounded-l-lg">{question.text}</td>
                      <td className="py-2 px-4 border-t border-b border-r rounded-l-lg text-center"><span className='px-2 py-1 rounded text-[0.9rem] text-yellow-500 bg-yellow-100 mr-2'><strong>{question.minutes}</strong> minutes</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-2 px-4 border-b text-center">No questions available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-full overflow-y-auto">
        <button onClick={onClose} className="float-right text-gray-500">Close</button>
        {children}
      </div>
    </div>
  );
};

export default ApplicationsPage;