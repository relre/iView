import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import { PlayCircleIcon } from '@heroicons/react/24/outline';

const ApplicationDetailPage = () => {
  const { id, applicationId } = useParams();
  const application = useInterviewStore((state) => state.application);
  const fetchApplicationById = useInterviewStore((state) => state.fetchApplicationById);
  const updateApplicationStatus = useInterviewStore((state) => state.updateApplicationStatus);

  const fetchInterviewQuestions = useInterviewStore((state) => state.fetchInterviewQuestions);
  const interviewQuestions = useInterviewStore((state) => state.interviewQuestions); // interviewQuestions state'ini al
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);

  const startVideoAt = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

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
        <span className="bg-gray-200 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
        {formatTime(startTime)} - {formatTime(currentTime)}  </span>
        <span className='text-sm'> {question.text}</span>
      </li>
    );
  }) : <li>No questions available</li>;

  return (
    <div>
            <h1 className="text-4xl py-4 font-bold text-rtwgreen mb-4">Application Detail</h1>

    

      <div className='flex p-6 rounded-lg bg-white shadow-lg'>
        <div className='w-1/2 p-3'>
      <video ref={videoRef} className='w-full rounded-lg' controls>
        <source src={videoUrl}/>
        Your browser does not support the video tag.
      </video>
      <button 
            onClick={() => startVideoAt(5)} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Video at 5s
          </button>

          <button 
            onClick={() => startVideoAt(2)} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Video at 2s
          </button>
      </div>
      <div className='w-1/2 p-6'>
      <div>
      <div className='flex items-center'><PlayCircleIcon className='w-6 h-6 text-rtwgreen mr-2' /> 
              <h2 className='text-2xl'><strong>{application.name}  {' '}
              <span className='text-rtwgreendark'>{application.surname}</span></strong> </h2></div>
              <p className=' mt-2'><strong>Email:</strong> {application.email}</p>
              <p className=' mb-2'><strong>Phone:</strong> {application.phone}</p>
              <p>
              {application.status === 'approved' ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                    Approved
                  </span>
                ) : application.status === 'rejected' ? (
                  <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                    Rejected</span>

                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">Pending</span>
            
                )}
                              
               </p>

      </div>
      <div className='overflow-y-auto max-h-96 mt-4'>
      <h2 className="text-xl font-bold mb-2 text-rtwgreen border-b w-1/3 border-rtwgreen">Questions</h2>
      <ul>
        {questionList}
      </ul>
      </div>
      </div>

      </div>
      <div className='flex justify-center mt-5 mr-10'>
      <form onSubmit={handleSubmit}>
        <label className='mb-2  text-sm font-medium text-gray-900'>
          Update Status:
          <select className='ml-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-rtwgreen p-2.5 ' value={status} onChange={handleStatusChange}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <button type="submit" className='bg-rtwgreen hover:bg-rtwgreendark text-sm text-white px-4 py-2 ml-2 rounded-lg'>Update</button>
      </form>
      </div>
      <div className='mt-5 mr-10'>
        <strong>T: </strong>{application.datax?.transcript ? application.datax.transcript : 'No transcript available'}
      </div>      
      <div className='mt-5 mr-10'>
        <strong>Y: </strong>{application.datax?.sentiment ? `${application.datax.sentiment.label} (${application.datax.sentiment.score})` : 'No sentiment analysis available'}
      </div>
      <div className='mt-5 mr-10'>
        <strong>D: </strong>
        <ul>
          {application.datax?.emotions ? (
            application.datax.emotions.map((emotion, index) => (
              <li key={index}>{emotion}</li>
            ))
          ) : (
            <li>No emotion analysis available</li>
          )}
        </ul>
      </div>

     
    </div>
  );
};

export default ApplicationDetailPage;