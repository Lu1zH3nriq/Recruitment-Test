import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Roteiros from './pages/Roteiros.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserContext from './context/userContext.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/roteiros" element={<Roteiros />} />
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