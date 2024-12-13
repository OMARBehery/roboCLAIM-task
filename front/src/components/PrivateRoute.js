import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const jwt = localStorage.getItem('token');

  if (!jwt) {
    // If there's no JWT, redirect to the login page
    return <Navigate to="/" />;
  }

  return children; // If there's a JWT, render the children components (Dashboard)
};

export default PrivateRoute;
