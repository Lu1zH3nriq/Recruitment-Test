import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Roteiros from './pages/Roteiros.js';
import PainelAdmin from './pages/painelAdmin.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserContext from './context/userContext.js';

import ProtectedRoutes from './authentication/protectedRoutes.js';
import Unauthorized from './pages/UnauthorizedPage.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [userData, setUserData] = useState(() => {
    const stored = sessionStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!userData);

  useEffect(() => {
    if (userData) {
      sessionStorage.setItem('userData', JSON.stringify(userData));
      setIsLoggedIn(true);
    } else {
      sessionStorage.removeItem('userData');
      setIsLoggedIn(false);
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData, isLoggedIn, setIsLoggedIn }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/roteiros"
            element={
              <ProtectedRoutes>
                <Roteiros />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/painelAdmin"
            element={
              <ProtectedRoutes>
                <PainelAdmin />
              </ProtectedRoutes>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);