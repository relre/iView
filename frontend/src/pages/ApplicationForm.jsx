import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';

const ApplicationForm = () => {
  const { link, id } = useParams();
  const { addApplication } = useInterviewStore();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    gdprConsent: false,
    videoUrl: '',
  });
  const [step, setStep] = useState(1); // Adım sayacı
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2); // İkinci adıma geç
    } else {
      console.log('Submitting form data:', formData); // Debug log
      try {
        if (videoBlob) {
          const videoUrl = await uploadVideo(videoBlob);
          formData.videoUrl = videoUrl;
        }
        await addApplication(link, id, formData);
        alert('Application submitted successfully');
      } catch (error) {
        console.error('Failed to submit application:', error);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  const uploadVideo = async (blob) => {
    const formData = new FormData();
    formData.append('video', blob, 'interview.webm');
    const response = await fetch('http://localhost:5555/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url; // Sunucudan dönen video URL'si
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Application Form</h1>
      {step === 1 ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Surname"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <input
            type="checkbox"
            name="gdprConsent"
            checked={formData.gdprConsent}
            onChange={handleChange}
            className="mb-2"
          /> I consent to the GDPR policy
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Next
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Video Recording and Questions</h2>
          <video ref={videoRef} autoPlay muted className="w-full mb-4"></video>
          {recording ? (
            <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
              Stop Recording
            </button>
          ) : (
            <button onClick={startRecording} className="bg-green-500 text-white px-4 py-2 rounded">
              Start Recording
            </button>
          )}
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
            Submit Application
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;