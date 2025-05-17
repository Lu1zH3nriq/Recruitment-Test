import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../context/userContext.js';

function ProtectedRoute({ children }) {
  const { userData } = useContext(UserContext);

  if (!userData) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;