import React, { useState } from 'react';
import './PlayerRegistration.css';
import { dbHelpers } from '../config/supabase';

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
  const [savedVia, setSavedVia] = useState(null); // 'supabase' | 'local'
  const [errorMsg, setErrorMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const save = async () => {
      try {
        // Try Supabase
        await dbHelpers.createPlayer({
          name: form.name,
          age: form.age,
          phone: form.phone,
          building: form.building,
          wing: form.wing,
          flat: form.flat
        });
        setSavedVia('supabase');
        setSubmitted(true);
      } catch (err) {
        // fallback to localStorage
        console.error('Supabase insert failed, falling back to localStorage', err);
        setErrorMsg(err?.message || 'Supabase insert failed');
        const LOCAL_KEY = 'splRegisteredPlayers';
        const prev = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
        localStorage.setItem(LOCAL_KEY, JSON.stringify([...prev, form]));
        setSavedVia('local');
        setSubmitted(true);
      }
    };

    save();
  };

  // Attempt to sync any locally saved registrations to Supabase
  const syncLocalToSupabase = async () => {
    // This function posts local records to the local sync server we added at /sync
    // Make sure you run the server from `server/` with SUPABASE_SERVICE_ROLE in server/.env
    const LOCAL_KEY = 'splRegisteredPlayers';
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    if (!stored || stored.length === 0) {
      setSyncResult({ ok: true, message: 'No local registrations to sync.' });
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const resp = await fetch((process.env.REACT_APP_SYNC_SERVER_URL || '') + '/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stored)
      });

      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload.error || `Sync server returned ${resp.status}`);
      }

      const data = await resp.json();
      // if inserted all, clear local storage
      if (data && data.inserted && data.inserted >= stored.length) {
        localStorage.removeItem(LOCAL_KEY);
        setSavedVia('supabase');
        setSyncResult({ ok: true, message: 'All local registrations synced to Supabase.' });
      } else if (data && data.inserted) {
        // partially inserted; remove that many from stored
        const remaining = stored.slice(data.inserted);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(remaining));
        setSavedVia(remaining.length > 0 ? 'local' : 'supabase');
        setSyncResult({ ok: true, message: `${data.inserted} registration(s) synced; ${remaining.length} remaining.` });
      } else {
        throw new Error('No records were inserted by sync server');
      }
    } catch (err) {
      console.error('Sync to server failed', err);
      setSyncResult({ ok: false, message: err.message || 'Sync failed' });
    }

    setSyncing(false);
  };

  return (
    <div className="registration-modal">
      <div className="registration-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Player Registration</h2>
        {submitted ? (
          <div className="success-message">
            {savedVia === 'supabase' ? (
              <>
                <strong>Registration saved to Supabase ✅</strong>
                <div style={{marginTop:8}}>Thank you — we received the registration.</div>
              </>
            ) : (
              <>
                <strong>Saved locally (Supabase failed)</strong>
                <div style={{marginTop:8,color:'#ffdede'}}>We saved your registration locally because the server failed. It will not be synced automatically.</div>
                {errorMsg && <div style={{marginTop:6,color:'#ffb3b3'}}>Error: {errorMsg}</div>}
              </>
            )}
            <div style={{textAlign:'center', marginTop:12, display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}>
              {savedVia === 'local' && (
                <>
                  <button className="btn-secondary" onClick={syncLocalToSupabase} disabled={syncing}>
                    {syncing ? 'Syncing...' : 'Sync to Supabase'}
                  </button>
                </>
              )}
              <button className="btn-primary" onClick={onClose}>Close</button>
            </div>
            {syncResult && (
              <div style={{marginTop:10,textAlign:'center', color: syncResult.ok ? '#bfffcf' : '#ffdede'}}>{syncResult.message}</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="registration-form" noValidate>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full name</label>
              <input id="name" className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required aria-required="true" />
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">Age</label>
              <input id="age" className="form-input" type="number" name="age" value={form.age} onChange={handleChange} required min="5" max="100" />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone number</label>
              <input id="phone" className="form-input" type="tel" name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10 digit mobile" />
            </div>

            <div className="form-group">
              <label htmlFor="building" className="form-label">Building</label>
              <select id="building" className="form-input" name="building" value={form.building} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Sankalp 1">Sankalp 1</option>
                <option value="Sankalp 2">Sankalp 2</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="wing" className="form-label">Wing</label>
              <select id="wing" className="form-input" name="wing" value={form.wing} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="flat" className="form-label">Flat number</label>
              <input id="flat" className="form-input" type="text" name="flat" value={form.flat} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-primary">Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PlayerRegistration;
