import logo from './logo.svg';
import './App.css';
import SignupForm from './components/SignupForm';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Files from './components/Files';
import Dashboard from './components/Dashboard';
function App() {
  return (
    <Router>
    <Navbar/>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/files" element={<Files />} />
        <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      </Routes>
    </Router>
  );
}
export default App;
