import React, { useState } from 'react';
import axios from 'axios';

const UploadVideo = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/transcribe', { url });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter video URL" value={url} onChange={handleUrlChange} />
        <button type="submit">Analyze Video</button>
      </form>
      {result && (
        <div>
          <h3><strong>Transcript:</strong></h3>
          <p>{result.transcript}</p>
          <h3><strong>Sentiment:</strong></h3>
          <p><strong>Label:</strong> {result.sentiment.label}</p>
          <p><strong>Score:</strong> {result.sentiment.score}</p>
          <h3>Emotions:</h3>
          <ul>
            {result.emotions.map((emotion, index) => (
              <li key={index}>{emotion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadVideo;