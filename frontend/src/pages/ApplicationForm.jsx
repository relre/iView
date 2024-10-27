import { useState, useRef, useEffect } from 'react';
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
  const [step, setStep] = useState(1);
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [timer, setTimer] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerIntervalRef = useRef(null);

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
      setStep(2);
    } else {
      console.log('Submitting form data:', formData);
      try {
        let videoUrl = '';
        if (videoBlob) {
          videoUrl = await uploadVideo(videoBlob);
          setFormData((prevData) => ({
            ...prevData,
            videoUrl: videoUrl,
          }));
        }
        await addApplication(link, id, { ...formData, videoUrl });
        alert('Application submitted successfully');
      } catch (error) {
        console.error('Failed to submit application:', error);
        alert(`Failed to submit application: ${error.message}`);
      }
    }
  };

  const requestCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      videoRef.current.srcObject = stream;

      // Initialize audio context and analyser
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const maxLevel = Math.max(...dataArray);
        setAudioLevel(maxLevel);
        requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Failed to get media stream:', error);
    }
  };

  const startRecording = () => {
    const recorder = new MediaRecorder(mediaStream);
    setMediaRecorder(recorder);
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      mediaStream.getTracks().forEach(track => track.stop());
    };
    recorder.start();
    setRecording(true);
    startTimer();
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
    stopTimer();
  };

  const startTimer = () => {
    setTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerIntervalRef.current);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const uploadVideo = async (blob) => {
    const formData = new FormData();
    const randomId = generateRandomId();
    const fileName = `${randomId}.webm`;
    formData.append('file', blob, fileName);
    
    const response = await fetch('http://localhost:5555/api/upload', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
  
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server response is not JSON');
    }
  
    const data = await response.json();
    return data.url;
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
          <div className="relative">
            <video ref={videoRef} autoPlay muted className="w-half mb-4"></video>
            {recording && (
              <div className="absolute top-0 left-0 bg-black text-white p-1 text-xs">
                {formatTime(timer)}
              </div>
            )}
          </div>
          {!mediaStream ? (
            <button onClick={requestCameraPermissions} className="bg-blue-500 text-white px-4 py-2 rounded">
              Open Camera
            </button>
          ) : recording ? (
            <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
              Stop Recording
            </button>
          ) : (
            <button onClick={startRecording} className="bg-green-500 text-white px-4 py-2 rounded">
              Start Recording
            </button>
          )}
          {videoUrl && (
            <div className="mt-4">
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Watch Recorded Video
              </a>
            </div>
          )}
          <div className="mt-4">
            <div className="bg-gray-200 w-full h-2 rounded">
              <div className="bg-green-500 h-2 rounded" style={{ width: `${audioLevel / 2.55}%` }}></div>
            </div>
          </div>
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
            Submit Application
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;