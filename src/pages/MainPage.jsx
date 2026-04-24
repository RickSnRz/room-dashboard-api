import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { isAuthenticated } from '../utils/authUtils';

const MainPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/'); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Barra lateral (NavBar) */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex-grow p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainPage;
