import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence
import os
import tempfile

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    audio = AudioSegment.from_file(file_path)
    chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=audio.dBFS-14, keep_silence=500)
    
    transcript = ""
    for i, chunk in enumerate(chunks):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            chunk.export(temp_file.name, format="wav")
            temp_file_path = temp_file.name
        
        with sr.AudioFile(temp_file_path) as source:
            audio_listened = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_listened)
                transcript += text + " "
            except sr.UnknownValueError:
                pass
            except sr.RequestError:
                pass
        
        os.remove(temp_file_path)
    return transcript

# Example usage
# print(transcribe_audio("path_to_your_audio_file"))