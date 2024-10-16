import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const email = useAuthStore((state) => state.email);
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">HR App</div>
      <div className="flex items-center">
        <span className="mr-4">{email}</span>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;