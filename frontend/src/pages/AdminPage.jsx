import { useState, useEffect } from 'react';

const AdminPage = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    // Adminleri API'den çek
    fetch('/api/auth/admins', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => setAdmins(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admins</h1>
      <ul>
        {admins.map(admin => (
          <li key={admin._id} className="p-2 bg-white mb-2 rounded shadow">
            {admin.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;