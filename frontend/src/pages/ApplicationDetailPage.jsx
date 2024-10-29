import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';

const ApplicationDetailPage = () => {
  const { id, applicationId } = useParams();
  const application = useInterviewStore((state) => state.application);
  const fetchApplicationById = useInterviewStore((state) => state.fetchApplicationById);
  const fetchInterviewQuestions = useInterviewStore((state) => state.fetchInterviewQuestions);
  const interviewQuestions = useInterviewStore((state) => state.interviewQuestions); // interviewQuestions state'ini al
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchApplicationById(id, applicationId);
    fetchInterviewQuestions(id);
  }, [fetchApplicationById, fetchInterviewQuestions, id, applicationId]);

  useEffect(() => {
    if (application) {
      setStatus(application.status);
    }
  }, [application]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with status:', status); // Debug log
    try {
      await updateApplicationStatus(id, applicationId, status);
      console.log('Status updated successfully'); // Debug log
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (!application) {
    return <div>Loading...</div>;
  }

  const videoUrl = `http://tkk04oksokwwgwswgg84cg4w.5.253.143.162.sslip.io/uploads/RemoteTech/Emin-Okan/${application.videoUrl}`;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  let currentTime = 0;
  const questionList = interviewQuestions && interviewQuestions.length > 0 ? interviewQuestions.map((question, index) => {
    const startTime = currentTime;
    currentTime += question.minutes * 60; // Dakikayı saniyeye çevir
    return (
      <li key={index}>
        {formatTime(startTime)} - {formatTime(currentTime)} - {question.text}
      </li>
    );
  }) : <li>No questions available</li>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Application Detail</h1>
      <p><strong>Name:</strong> {application.name}</p>
      <p><strong>Surname:</strong> {application.surname}</p>
      <p><strong>Email:</strong> {application.email}</p>
      <p><strong>Phone:</strong> {application.phone}</p>
      <p><strong>Status:</strong> {application.status}</p>

      <video width="320" height="240" controls>
        <source src={videoUrl}/>
        Your browser does not support the video tag.
      </video>

      <form onSubmit={handleSubmit}>
        <label>
          Update Status:
          <select value={status} onChange={handleStatusChange}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <button type="submit">Update</button>
      </form>

      <h2 className="text-xl font-bold mt-4">Questions</h2>
      <ul>
        {questionList}
      </ul>
    </div>
  );
};

export default ApplicationDetailPage;