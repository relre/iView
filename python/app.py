from flask import Flask, request, jsonify
from flask_cors import CORS
from analyze_video import extract_audio_from_video, transcribe_audio, analyze_emotions
from sentiment_analysis import analyze_sentiment

app = Flask(__name__)
CORS(app)  # CORS desteği ekleyin

@app.route('/transcribe', methods=['POST'])
def transcribe():
    file = request.files['file']
    file_path = f"./{file.filename}"
    file.save(file_path)
    print(f"File saved to {file_path}")

    audio_path = extract_audio_from_video(file_path)
    print(f"Audio extracted to {audio_path}")

    transcript = transcribe_audio(audio_path)
    print(f"Transcript: {transcript}")

    sentiment = analyze_sentiment(transcript)
    print(f"Sentiment: {sentiment}")

    emotions = analyze_emotions(file_path)
    print(f"Emotions: {emotions}")

    return jsonify({"transcript": transcript, "sentiment": sentiment, "emotions": emotions})

if __name__ == '__main__':
    app.run(debug=True)