import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';

const ApplicationsPage = () => {
  const { link, id } = useParams();
  const { applications = [], fetchApplications } = useInterviewStore();

  useEffect(() => {
    fetchApplications(link, id);
  }, [fetchApplications, link, id]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Applications Page</h1>
      <h2 className="text-xl mb-4">Applications for Interview {link} {id}</h2>
      <ul>
        {applications.map((application) => (
          <li key={application._id} className="mb-2 p-2 border border-gray-300 rounded">
            <Link to={`/admin/interview/${id}/applications/${application._id}`}>
              <p><strong>Name:</strong> {application.name}</p>
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