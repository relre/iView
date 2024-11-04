import os
import sys
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from analyze_video import extract_audio_from_video, transcribe_audio, analyze_emotions
from sentiment_analysis import analyze_sentiment
from celery import Celery
from celery_config import make_celery  # Yeni dosya adıyla import edin
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

app = Flask(__name__)
CORS(app)  # CORS support

app.config.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0'
)

celery = make_celery(app)  # Celery'i yapılandırın

@celery.task
def update_application_data(interview_id, application_id, datax):
    update_url = f'http://localhost:5555/api/interview/{interview_id}/applications/{application_id}/transcribe'
    update_response = requests.put(update_url, json={"datax": datax})
    print(f"PUT request to {update_url} with data {datax}")
    print(f"PUT response status: {update_response.status_code}")
    print(f"PUT response text: {update_response.text}")

    if not update_response.ok:
        return {"error": "Failed to update application data"}, 500

    return update_response.json(), 200

@app.route('/transcribe', methods=['POST'])
def transcribe():
    data = request.get_json()
    application_id = data['id']
    interview_id = data['interviewId']
    video_url = data['url']
    file_path = "./temp_video.webm"

    # Download the video from the URL
    response = requests.get(video_url)
    with open(file_path, 'wb') as file:
        file.write(response.content)
    print(f"File downloaded to {file_path}")

    audio_path = extract_audio_from_video(file_path)
    print(f"Audio extracted to {audio_path}")

    transcript = transcribe_audio(audio_path)
    print(f"Transcript: {transcript}")

    sentiment = analyze_sentiment(transcript)
    print(f"Sentiment: {sentiment}")

    emotions = analyze_emotions(file_path)
    print(f"Emotions: {emotions}")

    # Clean up the downloaded video file
    os.remove(file_path)
    print(f"File {file_path} removed")

    datax = {
        "transcript": transcript,
        "sentiment": sentiment,
        "emotions": emotions
    }

    # Ensure all data is ready before making the PUT request
    print(f"Data ready for PUT request: {datax}")

    # Make a PUT request to update the application data
    update_application_data.delay(interview_id, application_id, datax)

    return jsonify({"datax": datax})

if __name__ == '__main__':
    app.run(debug=True)