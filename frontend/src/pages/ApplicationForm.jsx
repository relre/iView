import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';

const ApplicationForm = () => {
  const { link, id } = useParams();
  const { addApplication } = useInterviewStore();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    gdprConsent: false,
    videoUrl: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Debug log
    try {
      await addApplication(link, id, formData);
      alert('Application submitted successfully');
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Application Form</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="text"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          placeholder="Surname"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <input
          type="checkbox"
          name="gdprConsent"
          checked={formData.gdprConsent}
          onChange={handleChange}
          className="mb-2"
        /> I consent to the GDPR policy
        <input
          type="text"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="Video URL"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;