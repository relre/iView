import { useState, useEffect } from 'react';

const QuestionPackagePage = () => {
  const [questionPackages, setQuestionPackages] = useState([]);

  useEffect(() => {
    // Question Packages'ı API'den çek
    fetch('http://localhost:5000/api/question-packages', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => setQuestionPackages(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Question Packages</h1>
      <ul>
        {questionPackages.map(pkg => (
          <li key={pkg._id} className="p-2 bg-white mb-2 rounded shadow">
            {pkg.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionPackagePage;