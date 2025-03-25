import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  adminLoginAsync,
  selectIsLoggedIn,
} from '../../features/auth/authSlice';
import { AppDispatch } from '../../store/store';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Handle form input changes
  const setData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Email:', formData.username);
    console.log('Password:', formData.password);

    try {
      await dispatch(adminLoginAsync(formData)).unwrap();
      toast.success('Admin Login successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error);
    }
    // Dispatch the form data to the redux async action
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="email"
              name="username" // Make sure to use the same name as the state property
              value={formData.username}
              onChange={setData}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password" // Make sure to use the same name as the state property
              value={formData.password}
              onChange={setData}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
