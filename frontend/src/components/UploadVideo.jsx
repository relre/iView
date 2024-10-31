import React, { useState } from 'react';
import axios from 'axios';

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload and Analyze</button>
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