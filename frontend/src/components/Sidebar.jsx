import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-full bg-gray-800 text-white w-64 flex flex-col">
      <div className="p-4 text-2xl font-bold">Admin Panel</div>
      <nav className="flex-1">
        <ul>
          <li className="p-4 hover:bg-gray-700">
            <Link to="/admin">Admins</Link>
          </li>
          <li className="p-4 hover:bg-gray-700">
            <Link to="/question-packages">Question Packages</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;