import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import axios from 'axios';

const ApplicationForm = () => {
  const { link, id } = useParams();
  const { addApplication, fetchInterviewQuestions, fetchInterviewById, interviewQuestions } = useInterviewStore();
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
  const mediaRecorderRef = useRef(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const questionTimerRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      const interview = await fetchInterviewById(id);
      if (interview) {
        setIsPublished(interview.isPublished);
        setIsExpired(new Date(interview.expireDate) < new Date());
        fetchInterviewQuestions(id);
      }
    };
    fetchInterview();
  }, [fetchInterviewById, fetchInterviewQuestions, id]);

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
      if (!formData.gdprConsent) {
        setWarningMessage('You must consent to the GDPR policy to proceed.');
        return;
      }
      setWarningMessage('');
      setStep(2);
    } else {
      console.log('Submitting form data:', formData);
      try {
        if (videoBlob) {
          const videoUrl = await uploadVideo(videoBlob);
          formData.videoUrl = videoUrl;
        }
        await addApplication(link, id, formData);
        setWarningMessage('Application submitted successfully');
      } catch (error) {
        console.error('Failed to submit application:', error);
        setWarningMessage(`Failed to submit application: ${error.message}`);
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
    console.log('Starting recording...');
    const recorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = recorder;
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
      mediaStream.getTracks().forEach(track => track.stop());
    };
    recorder.start();
    console.log('MediaRecorder state:', recorder.state);
    setRecording(true);
    startTimer();
    startQuestionTimer();
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      console.log('MediaRecorder state:', recorder.state);
      recorder.stop();
      setRecording(false);
      stopTimer();
      stopQuestionTimer();
      setShowSubmitButton(true);
    } else {
      console.log('MediaRecorder is already inactive or not initialized.');
    }
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

  const startQuestionTimer = () => {
    let questionIndex = 0;
    const showNextQuestion = () => {
      if (questionIndex < interviewQuestions.length) {
        setCurrentQuestion(interviewQuestions[questionIndex]);
        const questionDuration = interviewQuestions[questionIndex].minutes * 1000;
        questionTimerRef.current = setTimeout(() => {
          questionIndex++;
          showNextQuestion();
        }, questionDuration);
      } else {
        setCurrentQuestion(null);
        console.log('All questions completed. Stopping recording...');
        stopRecording();
        setShowSubmitButton(true);
      }
    };
    showNextQuestion();
  };

  const stopQuestionTimer = () => {
    clearTimeout(questionTimerRef.current);
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
  
    try {
      const response = await axios.post('http://localhost:5555/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status !== 200) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Server response is not JSON');
      }
  
      return fileName;
    } catch (error) {
      throw new Error(`Failed to upload video: ${error.message}`);
    }
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
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Next
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Video Recording and Questions</h2>
          {!showSubmitButton && (
            <>
              <div className="relative">
                <video ref={videoRef} autoPlay muted className="w-half mb-4"></video>
                {recording && (
                  <div className="absolute top-0 left-0 bg-black text-white p-1 text-xs">
                    {formatTime(timer)}
                  </div>
                )}
                {currentQuestion && (
                  <div className="absolute top-0 right-0 bg-white text-black p-2 rounded shadow-md">
                    {currentQuestion.text} ({currentQuestion.minutes} seconds)
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
              <div className="mt-4">
                <div className="bg-gray-200 w-1/6 h-2 rounded">
                  <div className="bg-green-500 h-2 rounded" style={{ width: `${audioLevel / 2.55}%` }}></div>
                </div>
              </div>
            </>
          )}
          {showSubmitButton && (
            <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
              Submit Application
            </button>
          )}
          {warningMessage && <p className="text-red-500">{warningMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;