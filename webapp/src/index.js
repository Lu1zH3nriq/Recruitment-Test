import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Roteiros from './pages/Roteiros.js';
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

  useEffect(() => {
    if (userData) {
      sessionStorage.setItem('userData', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('userData');
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
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