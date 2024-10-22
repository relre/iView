import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';

const ApplicationList = () => {
  const { id } = useParams(); // Interview ID'yi kullanın
  const { applications, fetchApplications } = useInterviewStore((state) => ({
    applications: state.applications,
    fetchApplications: state.fetchApplications,
  }));

  useEffect(() => {
    if (id) {
      fetchApplications(id); // ID'yi kullanarak fetchApplications çağırın
    }
  }, [fetchApplications, id]);

  console.log('Applications:', applications); // Debug log

  if (!applications || applications.length === 0) {
    return <div>No applications found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <ul>
        {applications.map((application) => (
          <li key={application._id} className="p-2 bg-white mb-2 rounded shadow">
            <p>Name: {application.name}</p>
            <p>Surname: {application.surname}</p>
            <p>Email: {application.email}</p>
            <p>Phone: {application.phone}</p>
            <p>GDPR Consent: {application.gdprConsent ? 'Yes' : 'No'}</p>
            <p>Video URL: <a href={application.videoUrl} target="_blank" rel="noopener noreferrer">{application.videoUrl}</a></p>
            <p>Status: {application.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicationList;