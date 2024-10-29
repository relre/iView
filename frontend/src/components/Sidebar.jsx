import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logo from '../assets/iview-logo.png'; 
import { QueueListIcon, Square3Stack3DIcon, ArrowRightEndOnRectangleIcon  } from '@heroicons/react/24/solid';


const Sidebar = () => {
  const email = useAuthStore((state) => state.email);
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };


  return (
    <aside className="sticky flex flex-col w-64 bg-transparent">
      
      <div className="flex p-4 justify-center">
        <a href="/admin"><img src={logo} className="max-w-[10rem]" alt="logo" /></a>
      </div>
      <nav className="flex-1">
        <ul>
          
          <li className="p-3 m-3 hover:bg-rtwgreenligth rounded-md flex">
          <QueueListIcon  className="h-6 w-6 mr-2 text-rtwyellow" /><Link to="/admin/question-packages">  Question Packages</Link>
          </li>
          <li className="p-3 m-3 hover:bg-rtwgreenligth rounded-md flex">
          <Square3Stack3DIcon  className="h-6 w-6 mr-2 text-rtwyellow" /><Link to="/admin/interviews">Interview List</Link>
          </li>
        </ul>
      </nav>
      <div>

      <div className="h-64">
        <div className='flex flex-col mb-12 justify-end bg-white rounded-lg shadow-xl py-4 m-5'>
        <span className='text-center text-xs mb-2 text-gray-400'><strong>iView</strong> Beta v1.0</span>
      <span className="mx-auto mb-2">{email}</span>
        <button onClick={handleLogout} className="border flex mx-auto p-2 w-1/2 rounded-md">
        <ArrowRightEndOnRectangleIcon   className="h-6 w-6 mr-2 text-black ml-2" /> Logout
        </button>
       
        </div>
      </div>
      
      </div>
    </aside>
  );
};

export default Sidebar;