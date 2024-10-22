import { useState, useEffect } from 'react';
import useInterviewStore from '../store/interviewStore';

const InterviewPage = () => {
  const { interviews, questionPackages, fetchInterviews, fetchQuestionPackages, addInterview, deleteInterview } = useInterviewStore();
  const [newInterview, setNewInterview] = useState({
    title: '',
    isPublished: false,
    link: '',
    expireDate: '',
    questions: [],
    questionPacks: [],
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInterviews();
    fetchQuestionPackages();
  }, [fetchInterviews, fetchQuestionPackages]);

  const handleAddInterview = async (e) => {
    e.preventDefault();
    await addInterview(newInterview);
    setNewInterview({
      title: '',
      isPublished: false,
      link: '',
      expireDate: '',
      questions: [],
      questionPacks: [],
    });
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const link = generateLink(title);
    setNewInterview({ ...newInterview, title, link });
  };

  const generateLink = (title) => {
    const turkishMap = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    return title
      .split('')
      .map(char => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleQuestionPackChange = (e) => {
    const selectedPackId = e.target.value;
    setNewInterview((prevState) => {
      const questionPacks = prevState.questionPacks.includes(selectedPackId)
        ? prevState.questionPacks.filter((id) => id !== selectedPackId)
        : [...prevState.questionPacks, selectedPackId];
      return { ...prevState, questionPacks };
    });
  };

  const filteredQuestionPackages = questionPackages?.filter((pack) =>
    pack.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Interviews</h1>
      <form onSubmit={handleAddInterview} className="mb-4">
        <input
          type="text"
          value={newInterview.title}
          onChange={handleTitleChange}
          placeholder="Title"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="checkbox"
          checked={newInterview.isPublished}
          onChange={(e) => setNewInterview({ ...newInterview, isPublished: e.target.checked })}
          className="mb-2"
        /> Published
        <input
          type="text"
          value={newInterview.link}
          placeholder="Link"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          readOnly
        />
        <input
          type="date"
          value={newInterview.expireDate}
          onChange={(e) => setNewInterview({ ...newInterview, expireDate: e.target.value })}
          placeholder="Expire Date"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Question Packages</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Question Packages"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          {filteredQuestionPackages.map((pack) => (
            <div key={pack._id} className="mb-2">
              <input
                type="checkbox"
                value={pack._id}
                checked={newInterview.questionPacks.includes(pack._id)}
                onChange={handleQuestionPackChange}
              />
              <label className="ml-2">{pack.title}</label>
            </div>
          ))}
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Interview
        </button>
      </form>
      <ul>
        {interviews.map((interview) => (
          <li key={interview._id} className="p-2 bg-white mb-2 rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">

              <a href={`/admin/interview/${interview.link}/${interview._id}`}
               >{interview.title}</a>
                
                </h2>
              <p>Published: {interview.isPublished ? 'Yes' : 'No'}</p>
              <p>Link: <a href={`/interview/${interview.link}/${interview._id}`} target="_blank" rel="noopener noreferrer">{interview.link}</a></p>
            </div>
            <button
              onClick={() => deleteInterview(interview._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InterviewPage;