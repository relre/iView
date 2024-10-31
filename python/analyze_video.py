import cv2
import numpy as np
from deepface import DeepFace
import speech_recognition as sr
from moviepy.editor import VideoFileClip
from pydub import AudioSegment

def extract_audio_from_video(video_path: str):
    """Videodan ses çıkarır ve geçici bir dosyaya kaydeder."""
    video = VideoFileClip(video_path)
    audio_path = "temp_audio.wav"
    video.audio.write_audiofile(audio_path)
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

def analyze_emotions(video_path: str, frame_interval: int = 40):
    """Videodaki yüz ifadelerinden her 40 frame'de bir duygu analizi yapar."""
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
                analysis = DeepFace.analyze(frame, actions=['emotion'])
                dominant_emotion = analysis[0]['dominant_emotion']
                emotions.append(dominant_emotion)
                print(f"Frame {frame_count}: {dominant_emotion}")
            except Exception as e:
                print(f"Error processing frame {frame_count}: {e}")

        frame_count += 1

    video.release()
    return emotions

# Example usage
# audio_path = extract_audio_from_video("path_to_your_video_file")
# print(transcribe_audio(audio_path))
# print(analyze_emotions("path_to_your_video_file"))