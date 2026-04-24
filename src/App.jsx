import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Toaster } from "sonner"; // 🔥 IMPORTANTE

import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import Home from './pages/Home';
import Historial from './pages/Historial';
import Inquilinos from './pages/Inquilinos';
import Habitaciones from './pages/Habitaciones';
import Recibos from './pages/Recibos';
import Alquileres from './pages/Alquileres';

function App() {
  return (
    <>
      {/* 🔥 TOASTER GLOBAL */}
      <Toaster 
        theme="dark"
        richColors
        position="top-right"
      />

      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          <Route path="/mainpage" element={<MainPage />}>
            <Route path="home" element={<Home />} />
            <Route path="historial" element={<Historial />} />
            <Route path="alquileres" element={<Alquileres />} />
            <Route path="inquilinos" element={<Inquilinos />} />
            <Route path="habitaciones" element={<Habitaciones />} />
            <Route path="recibos" element={<Recibos />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
