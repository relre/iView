import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import { ClockIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const ApplicationsPage = () => {
  const { link, id } = useParams();
  const { applications = [], fetchApplications, totalApplications, nonPendingCount } = useInterviewStore();

  useEffect(() => {
    fetchApplications(link, id);
  }, [fetchApplications, link, id]);

  return (
    <div>
      <h1 className='text-4xl py-4 font-bold mb-4'>Applications for Interview <span className="text-4xl py-4 font-bold text-rtwgreen mb-4">{link}</span></h1>
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
      <ul>
        {applications.map((application) => (
          <li key={application._id} className="mb-2 p-2 border border-gray-300 rounded">
            <Link to={`/admin/interview/${id}/applications/${application._id}`}>
              <p><strong>Name:</strong> {application.name}    {application.length}</p>
              <p><strong>Surname:</strong> {application.surname}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Phone:</strong> {application.phone}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicationsPage;