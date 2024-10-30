import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import { ChevronDoubleRightIcon, CheckCircleIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
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
  const [intName, setIntName] = useState(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const questionTimerRef = useRef(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0); // New state for countdown timer
  const [submitForm, setSubmitForm] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      const interview = await fetchInterviewById(id);
      if (interview) {
        setIsPublished(interview.isPublished);
        setIsExpired(new Date(interview.expireDate) < new Date());
        setIntName(interview.title);
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
        setWarningMessage('KVKK metnini okuyup onaylamanız gerekmektedir.');
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
        setWarningMessage('Başvurunuz başarıyla alındı.');
        setSubmitForm(true);
      } catch (error) {
        console.error('Failed to submit application:', error);
        setWarningMessage(`Failed to submit application: ${error.message}`);
      }
    }
  };

  const requestCameraPermissions = async () => {
    try {
      const constraints = {
        video: {
          width: window.innerWidth < 800 ? { ideal: 450 } : { ideal: 1280 },
          height: window.innerWidth < 800 ? { ideal: 720 } : { ideal: 720 }
        },
        audio: true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      videoRef.current.srcObject = stream;

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
        const questionDuration = interviewQuestions[questionIndex].minutes * 60; // Convert minutes to seconds
        setQuestionTimeLeft(questionDuration); // Initialize countdown timer
        const countdownInterval = setInterval(() => {
          setQuestionTimeLeft(prevTime => {
            if (prevTime <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
        questionTimerRef.current = setTimeout(() => {
          questionIndex++;
          showNextQuestion();
        }, questionDuration * 1000);
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

  if (!isPublished || isExpired) {
    return <p>Başvuru kabul edilememektedir.</p>;
  }

  return (
    <div className='bg-white'>
      
      {step === 1 ? (
        <div className='bg-transparent'>
       <div className="flex flex-col justify-center items-center min-h-screen">

         <h1 className='text-3xl text-rtwgreen text-gr'>{intName}</h1>
         <h2 className=" text-center text-3xl text-rtwyellow font-bold text-rtwgreen mb-5">Video Mülakatı</h2>
       <div className="p-3 rounded-lg shadow-xl bg-white border-2 border-rtwgreen" >
       

         <h2 className=" text-center text-xl text-rtwgreen">Aday Bilgi Formu</h2>
         
         <form className="max-w-sm mx-auto p-6" onSubmit={handleSubmit}>
           <label className="block mb-2">
             İsim *
             <input
               type="text"
               name="name"
               value={formData.name}
               onChange={handleChange}
               
               className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:border-rtwgreen"
               required
             />
           </label>
           <label className="block mb-2">
             Soyisim *
             <input
               type="text"
               name="surname"
               value={formData.surname}
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:border-rtwgreen"
               required
             />
           </label>
           <label className="block mb-2">
             E-posta *
             <input
               type="email"
               name="email"
               value={formData.email}
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:border-rtwgreen"
               required
             />
           </label>
           <label className="block mb-2">
             Telefon *
             <input
               type="text"
               name="phone"
               value={formData.phone}
               onChange={handleChange}
               placeholder="+905555555555"
               className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:border-rtwgreen"
               required
             />
           </label>
           <label className="flex items-center cursor-pointer mt-2">
            <div className='relative'>
             <input
               type="checkbox"
               name="gdprConsent"
               checked={formData.gdprConsent}
               onChange={handleChange}
               className="appearance-none h-5 w-5 border border-gray-300 rounded checked:bg-rtwgreen focus:outline-none focus:ring-2 focus:ring-rtwgreen focus:ring-offset-2"
             /> 
             </div>
            <div className="absolute flex items-center justify-center">
                      
            </div>
            <span className='text-xs ml-2 mb-2'> KVKK bilgilendirmesini okudum ve kişisel verilerimin işlenmesine izin veriyorum.</span>

           </label>
           {warningMessage && <p className="text-red-500 mb-4">{warningMessage}</p>}
           <button type="submit" className="bg-rtwgreen hover:bg-rtwgreendar text-white px-4 py-2 mt-3 rounded flex justify-center w-full">
            <ChevronDoubleRightIcon className="h-5 w-5 mr-2 text-white text-sm" />
             Video Mülakatına Geç
           </button>
         </form>
       </div>
     </div></div>
     
      ) : (
        <div className='text-center'>
            
            <div className={`flex flex-col justify-center items-center min-h-screen`}>
               <div className={`${window.innerWidth < 800 && mediaStream ? 'hidden' : ''}`}><h1 className='text-3xl text-rtwgreen text-gr'>{intName}</h1>
               <h2 className=" text-center text-3xl text-rtwyellow font-bold text-rtwgreen mb-5">Video Mülakatı</h2></div>
         
          {!showSubmitButton && (
            <>
              <div className="relative">
                <video ref={videoRef} autoPlay muted className={`w-half min-h-screen mb-4 ${window.innerWidth < 800 ? 'mt-[-200px]' : ''} ${mediaStream ? ' ' : 'hidden'}`}></video>
                {window.innerWidth < 800 &&(
                <div className='absolute top-5 left-10 w-1/4 flex items-center'>
                <MicrophoneIcon className='h-6 w-6 text-white '/>
                  <div className="bg-gray-500 w-full h-2 rounded">
                  <div className="bg-green-500 h-2 rounded" style={{ width: `${audioLevel / 2.55}%` }}></div>
                  </div>
                </div>
                )}
                {recording && (
                  <div className="absolute top-0 left-[45%] rigth-0 bg-black text-white p-2 text-xs rounded-lg">
                    {formatTime(timer)}
                  </div>
                )}
                {currentQuestion &&  (
                  <div className="bg-white text-black p-2 flex-col mt-[-100px]">
                    <span className="bg-gray-200 text-gray-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded">
                    {formatTime(questionTimeLeft)}  </span> <p className='mt-2'>{currentQuestion.text}</p> 
                  </div>
              
                )}
              </div>
              {!mediaStream ? (
                <div className='flex flex-col'>
                  <div className='border-2 border-rtwgreen p-3 m-3 rounded-lg'>
                  <h4 className='text-rtwgreen text-3xl font-bold'>4 ADIMDA</h4>
                  <h4 className='text-rtwgreen text-3xl font-bold text-rtwyellow'>VİDEO MÜLAKAT</h4>
                  <h4 className='text-rtwgreen text-3xl font-bold'>NASIL YAPILIR?</h4>
                  </div>
                
<ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse p-5">
    <li class="flex items-center justify-center text-rtwgreen space-x-2.5 rtl:space-x-reverse">
        <span class="flex items-center justify-center w-8 h-8 border border-rtwgreen rounded-full shrink-0 ">
            1
        </span>
        <span>
            <h3 class="text-start font-medium leading-tight">Kamera ve Mikrofonunuzu Açın</h3>
            <p class="text-start text-sm">Video mülakata başlamak için bu adımda kamera ve video izni vermelisiniz.</p>
        </span>
    </li>
    <li class="flex items-center justify-center  space-x-2.5 rtl:space-x-reverse">
        <span class="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0">
            2
        </span>
        <span>
            <h3 class="text-start font-medium leading-tight">Mülakata Başlayın</h3>
            <p class="text-start text-sm">Kamera ve mikrofonunuzu kontrol ettikten sonra mülakata başlayın.</p>
        </span>
    </li>
    <li class="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
        <span class="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0">
            3
        </span>
        <span>
            <h3 class="text-start font-medium leading-tight">Soruları Cevaplayın</h3>
            <p class="text-start text-sm">Karşınıza çıkan soruları geri sayımda belirtilen süre içinde cevaplayın.</p>
        </span>
    </li>
    <li class="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
        <span class="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0">
            3
        </span>
        <span>
            <h3 class="text-start font-medium leading-tight">Mülakatı Gönderin</h3>
            <p class="text-start text-sm">Tüm sorular bittiğinde "Mülakat Başvurusunu Gönder" seçeneğine tıklayarak gönderin.</p>
        </span>
    </li>
</ol>


                 
                <button onClick={requestCameraPermissions} className="bg-rtwgreen hover:bg-rtwgreendark text-white px-4 py-2 m-3 rounded">
                  Kamera ve Mikrofonu Aç
                </button>

                <span className='text-sm mt-2 text-gray-500'>* Video mülakatı başlatmak için kamera ve mikrofon izni vermelisiniz.</span>
                </div>
              ) : recording ? (
                <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">
                  Mülakatı Bitir
                </button>
              ) : window.innerWidth < 800 ? (
                 <div className="relative flex flex-col p-3 mt-[-100px]">
                  <span className='text-rtwgreen'>Önemli Notlar</span>
                  <ul className='list-none text-start m-3 text-sm'> 
                    <li>- Kameranızı ve mikrofonunuzu test edin.</li>
                    <li>- Kayıt başladığında ekranda sorular çıkacaktır.</li>
                    <li>- Sorulara verilen sürede cevap vermeniz beklenmektedir.</li>
                    <li>- Hazır olduğunuzda mülakat kaydını başlayabilirsiniz. </li>
                  </ul>
                  <span>   </span>
                <button onClick={startRecording} className="bg-rtwgreen hover:bg-rtwgreendark text-white px-4 py-2 rounded flex items-center justify-center">
                 <VideoCameraIcon className='h-5 h6 mr-2 ' /> Mülakat Kaydını Başlat
                </button> 
                </div>
              ) : (
                <div className="relative flex flex-col p-3">
                  <span>Önemli Notlar</span>
                  <ul className='list-disc text-start m-3'> 
                    <li className='text-xs'>Kameranızı ve mikrofonunuzu test edin.</li>
                    <li>Kayıt başladığında ekranda sorular çıkacaktır.</li>
                    <li>Sorulara verilen sürede cevap vermeniz beklenmektedir.</li>
                    <li>Hazır olduğunuzda mülakat kaydını başlayabilirsiniz. </li>
                  </ul>
                  <span>   </span>
                <button onClick={startRecording} className="bg-rtwgreen hover:bg-rtwgreendark px-4 py-2 rounded">
                  Mülakat Kaydını Başlat
                </button> 
                </div> 
                
              
              )}
              
            </>
          )}
          {showSubmitButton && (
            <div className={`flex flex-col ${ submitForm ? 'hidden' : ' '}`}>
              <span className='text-2xl font-bold text-rtwyellow'>Son bir adım kaldı...</span>
            <button onClick={handleSubmit} className="bg-rtwgreen hover:bg-rtwgreendark text-white px-4 py-2 rounded mt-4">
              Mülakat Başvurusunu Gönder
            </button>
            </div>
          )}
          {warningMessage && 
          <div className='flex flex-col items-center'>
          <CheckCircleIcon className='h-24 w-24 text-rtwgreen mt-3' />
          <p className="text-rtwgreen font-bold text-xl mt-3">{warningMessage}</p>
          </div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;