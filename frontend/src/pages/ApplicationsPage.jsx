import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import { ClockIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

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
        Applications for Interview{' '}
        {interviewsec && (
          <span className="text-4xl py-4 font-bold text-rtwgreen mb-4">
            {interviewsec.title}
          </span>
        )}
      </h1>
      <div className='flex space-x-5'>
        <div className="mb-4 p-4 rounded shadow w-1/5 flex items-center green-gradient">
          <div className="mr-4 flex items-center justify-center h-10 w-10 ">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-center text-rtwgreen " />
          </div>
          <div>
            <div className='text-2xl font-bold'>{totalApplications}</div>
            Total Applications
          </div>
        </div>
        <div className="mb-4 p-4 rounded shadow w-1/5 flex items-center yellow-gradient">
          <div className="mr-4 flex items-center justify-center h-10 w-10">
            <ClockIcon className="w-8 h-8 text-center text-rtwyellow " />
          </div>
          <div>
            <div className='text-2xl font-bold'>{nonPendingCount}</div>
            Unexamined Application
          </div>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded p-2 w-full"
        />
        <div className="mt-2">
          <button onClick={() => handleFilterChange('all')} className={`mr-2 p-2 rounded ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            All
          </button>
          <button onClick={() => handleFilterChange('approved')} className={`mr-2 p-2 rounded ${filterStatus === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Approved
          </button>
          <button onClick={() => handleFilterChange('rejected')} className={`mr-2 p-2 rounded ${filterStatus === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Rejected
          </button>
          <button onClick={() => handleFilterChange('pending')} className={`p-2 rounded ${filterStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
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
      {interviewsec && (
        <>
          <h2 className='text-3xl py-4 font-bold mb-4'>Interview Details</h2>
          <p>
            <strong>Status:</strong>{' '}
            <span onClick={handleStatusToggle} className="cursor-pointer">
              {interviewsec.isPublished ? 'Active' : 'Passive'}
            </span>
          </p>
          <p>
            <strong>Expire Date:</strong>{' '}
            <input
              type="date"
              value={newExpireDate}
              onChange={handleExpireDateChange}
              className="border border-gray-300 rounded p-1"
            />
            {showSaveButton && (
              <button onClick={handleExpireDateSave} className="ml-2 p-1 bg-blue-500 text-white rounded">
                {saveButtonText}
              </button>
            )}
          </p>
          <button onClick={handleModalOpen} className="mt-4 p-2 bg-green-500 text-white rounded">
            Show Questions
          </button>
        </>
      )}
      {isModalOpen && (
        <Modal onClose={handleModalClose}>
          <h2 className='text-3xl py-4 font-bold mb-4'>Interview Questions</h2>
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Question</th>
                  <th className="py-2 px-4 border-b">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {interviewQuestions.length > 0 ? (
                  interviewQuestions.map((question, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">{question.text}</td>
                      <td className="py-2 px-4 border-b">{question.minutes}</td>
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
      <div className="bg-white p-4 rounded shadow-lg w-1/2 max-h-full overflow-y-auto">
        <button onClick={onClose} className="float-right text-red-500">Close</button>
        {children}
      </div>
    </div>
  );
};

export default ApplicationsPage;