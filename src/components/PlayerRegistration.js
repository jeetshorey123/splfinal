import React, { useState } from 'react';
import './Home.css';

const PlayerRegistration = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    building: '',
    wing: '',
    flat: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    const LOCAL_KEY = 'splRegisteredPlayers';
    const prev = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...prev, form]));
    setSubmitted(true);
  };

  return (
    <div className="registration-modal">
      <div className="registration-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Player Registration</h2>
        {submitted ? (
          <div className="success-message">Registration successful!</div>
        ) : (
          <form onSubmit={handleSubmit} className="registration-form">
            <label>Name:
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>Age:
              <input type="number" name="age" value={form.age} onChange={handleChange} required min="5" max="100" />
            </label>
            <label>Phone Number:
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" />
            </label>
            <label>Building:
              <select name="building" value={form.building} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Sankalp 1">Sankalp 1</option>
                <option value="Sankalp 2">Sankalp 2</option>
              </select>
            </label>
            <label>Wing:
              <select name="wing" value={form.wing} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </label>
            <label>Flat Number:
              <input type="text" name="flat" value={form.flat} onChange={handleChange} required />
            </label>
            <button type="submit" className="btn-primary">Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PlayerRegistration;
