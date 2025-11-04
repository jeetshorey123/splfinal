import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerRegistration from './PlayerRegistration';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // navigate back to home after closing registration
    navigate('/');
  };

  return (
    <div style={{ paddingTop: '1rem' }}>
      <PlayerRegistration onClose={handleClose} />
    </div>
  );
};

export default RegisterPage;
