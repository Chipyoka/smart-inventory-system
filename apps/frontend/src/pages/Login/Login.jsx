import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useUserStore } from '../../store/userStore';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setUser = useUserStore((state) => state.setUser);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', data.token);

      const { name, role } = data.user;
      setUser({ username: name, role });

      if (role === 'admin' || role === 'manager') {
        navigate('/dashboard');
      } else if (role === 'staff') {
        navigate('/scanner');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1>Smart Inventory Management System - SIMS</h1>
          <p>for Small & Medium Enterprises</p>
          <small>
            Designed & Developed By: <br />
            <strong>
              MPUNDU ISAAC | NANKONDE BEATRICE | CHITOSHI CHELA | MWINGA NAMASIKU
            </strong>
          </small>
        </div>

        <div className="login-right">
          <img src={logo} alt="SIMS Logo" className="logo" />
          <h2>Welcome back!</h2>
          <p className="subtitle">Provide your login credentials to continue</p>

          {error && <p className="error" role="alert">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-label="Email"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-label="Password"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              aria-label="Select role"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>

            {formData.role && (
              <p className="selected-role">Selected Role: {formData.role}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="footer-link">
            Don’t have an account? <Link to="#">Contact Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
