import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logo from '../assets/iview-logo.png'; 

const LoginPage = () => {
  const [email, setEmail] = useState('o@o.com');
  const [password, setPassword] = useState('1234');
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://iviewback.relre.dev/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token, email);
      navigate('/admin/question-packages');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 bg-transparent">
      <img src={logo} className="max-w-[10rem]" alt="logo" />
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-1/3 border-2 mt-4 mb-4 border-rtwgreen">
        <h1 className="text-2xl text-center font-bold text-rtwyellow mb-4"><span className='text-rtwgreen'>iView</span> Admin Login</h1>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-rtwgreen"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-rtwgreen"
            required
          />
        </div>
        <button type="submit" className="w-full bg-rtwgreen hover:bg-rtwgreendark text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;