import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import AdminLogin from './AdminLogin';
import './Home.css';

const LOCAL_KEY = 'splRegisteredPlayers';

const Admin = () => {
  const [players, setPlayers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('splAdminLoggedIn') === 'true');

  useEffect(() => {
    if (loggedIn) {
      const data = localStorage.getItem(LOCAL_KEY);
      if (data) setPlayers(JSON.parse(data));
    }
  }, [loggedIn]);

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditForm(players[idx]);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    const updated = [...players];
    updated[editIndex] = editForm;
    setPlayers(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    setEditIndex(null);
  };

  const handleDelete = (idx) => {
    if (window.confirm('Delete this player?')) {
      const updated = players.filter((_, i) => i !== idx);
      setPlayers(updated);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    }
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(players);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');
    XLSX.writeFile(wb, `SPL_Registered_Players_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleLogin = () => {
    sessionStorage.setItem('splAdminLoggedIn', 'true');
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-section">
      <h2>Registered Players</h2>
      <button className="btn-primary" onClick={downloadExcel} style={{marginBottom:16}}>Download Excel</button>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Phone</th>
              <th>Building</th>
              <th>Wing</th>
              <th>Flat</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 && (
              <tr><td colSpan="7" style={{textAlign:'center'}}>No registrations yet.</td></tr>
            )}
            {players.map((p, idx) => (
              <tr key={idx}>
                {editIndex === idx ? (
                  <>
                    <td><input name="name" value={editForm.name} onChange={handleEditChange} /></td>
                    <td><input name="age" value={editForm.age} onChange={handleEditChange} /></td>
                    <td><input name="phone" value={editForm.phone} onChange={handleEditChange} /></td>
                    <td><input name="building" value={editForm.building} onChange={handleEditChange} /></td>
                    <td><input name="wing" value={editForm.wing} onChange={handleEditChange} /></td>
                    <td><input name="flat" value={editForm.flat} onChange={handleEditChange} /></td>
                    <td>
                      <button className="btn-primary" onClick={handleEditSave}>Save</button>
                      <button className="btn-secondary" onClick={()=>setEditIndex(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.phone}</td>
                    <td>{p.building}</td>
                    <td>{p.wing}</td>
                    <td>{p.flat}</td>
                    <td>
                      <button className="btn-secondary" onClick={()=>handleEdit(idx)}>Edit</button>
                      <button className="btn-danger" onClick={()=>handleDelete(idx)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
