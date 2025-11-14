import React, { useState } from 'react';
import './Home.css';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'jeet' && password === 'jeet') {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="registration-modal">
      <div className="registration-content">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <label>Username:
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>Password:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <div className="error-message" style={{color:'red',marginBottom:'1rem'}}>{error}</div>}
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
