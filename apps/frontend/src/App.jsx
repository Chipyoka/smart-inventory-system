import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {React} from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Scanner from './pages/Scanner';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';
import './App.css'; // Assuming you have an App.css for global styles

const App = () => (
  
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <Inventory />
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <Analytics />
        </ProtectedRoute>
      } />

      <Route path="/scanner" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <Scanner />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
