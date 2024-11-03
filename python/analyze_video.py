import subprocess
import cv2
import numpy as np
from deepface import DeepFace
import speech_recognition as sr
from pydub import AudioSegment

def extract_audio_from_video(video_path: str):
    """Videodan ses çıkarır ve geçici bir dosyaya kaydeder."""
    audio_path = "temp_audio.wav"
    command = [
        'ffmpeg',
        '-y',  # Overwrite output files without asking
        '-i', video_path,
        '-vn',  # No video
        '-acodec', 'pcm_s16le',  # Audio codec
        '-ar', '44100',  # Audio sample rate
        '-ac', '2',  # Audio channels
        audio_path
    ]
    subprocess.run(command, check=True)
    return audio_path

def transcribe_audio(audio_path: str):
    """Bir ses dosyasını yazıya çevirir."""
    recognizer = sr.Recognizer()
    audio = AudioSegment.from_file(audio_path)
    audio.export("temp.wav", format="wav")  # pydub ile ses dosyasını wav formatına çevir
    with sr.AudioFile("temp.wav") as source:
        audio_data = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio_data, language='tr-TR')  # Türkçe dil desteği
        return text
    except sr.UnknownValueError:
        return "Konuşma anlaşılamadı."
    except sr.RequestError as e:
        return f"Google API hatası: {e}"

def analyze_emotions(video_path, frame_interval=40):
    """Analyze emotions in a video file by extracting frames at regular intervals."""
    video = cv2.VideoCapture(video_path)
    emotions = []

    frame_count = 0
    while True:
        ret, frame = video.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            print(f"Processing frame {frame_count}")
            try:
                analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                if isinstance(analysis, list):
                    analysis = analysis[0]  # Get the first dictionary from the list
                dominant_emotion = analysis['dominant_emotion']
                emotions.append(dominant_emotion)
                print(f"Frame {frame_count}: {dominant_emotion}")
            except Exception as e:
                print(f"Error processing frame {frame_count}: {e}")

        frame_count += 1

    video.release()
    return emotions