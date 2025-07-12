import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useUserStore } from '../store/userStore';

const Login = () =>{

      const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useUserStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        '/auth/login',
        { email, password }, // ✅ Object body
        { headers: { 'Content-Type': 'application/json' } } // ✅ Force header
      );
      login(res.data.token);
      alert('Login successful: ' + res.data.user.name);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };
    return(
        <>
         <div className="h-[600px] flex text-left">
            {/* Welcome message section */}
            <div className="hidden md:flex flex-1 flex-col justify-center p-12 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
              <h1 className="text-4xl font-bold mb-4">Smart Inventory Management System - SIMS</h1>
            </div>

            {/* Login form section */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              <form 
                onSubmit={handleLogin} 
                className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6  ">Login</h2>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-gray-800 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </>
    )
}
export default Login;