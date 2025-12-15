import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CheckCircle2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../../service/url';

const Signup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const sections = ['A', 'B', 'C', 'D'];
  const userRoles = ['student', 'teacher']; // Added teacher role

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Add userRole to the data
      const formData = {
        ...data,
        userRole: selectedRole
      };

      const response = await axios.post(`${backendUrl}/singup`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        toast.success('Signup successful!');
        setShowSuccess(true);
        reset();
        setSelectedRole('student'); // Reset to default

        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        toast.error(response.data.message || 'Signup failed!');
      }
    } catch (error) {
      toast.error('An error occurred!');
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {showSuccess && (
        <div className="absolute top-10 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle2 className="text-green-600 w-6 h-6" />
          <span>Signup successful! Redirecting...</span>
        </div>
      )}

      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600">Sign Up for VidyaSetu</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Profile Image</label>
            <input
              type="file"
              {...register('photo')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.photo && <p className="text-red-500 text-sm">{errors.photo.message}</p>}
          </div>

          {/* User Role Selection - NEW */}
          <div>
            <label className="block text-sm font-medium text-gray-700">I am a</label>
            <div className="flex space-x-4 mt-2">
              {userRoles.map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="radio"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email format',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile</label>
            <input
              type="tel"
              {...register('tel', {
                required: 'Mobile number is required',
                minLength: { value: 10, message: 'Enter a valid number' },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your mobile number"
            />
            {errors.tel && <p className="text-red-500 text-sm">{errors.tel.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Reg no</label>
            <input
              type="number"
              {...register('regno', { required: 'Reg no is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your reg no"
            />
            {errors.regno && <p className="text-red-500 text-sm">{errors.regno.message}</p>}
          </div>

          {/* Conditional Fields - Show only for students */}
          {selectedRole === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Year</label>
                <input
                  type="number"
                  {...register('batchYear', { 
                    required: 'Batch year is required', 
                    min: { value: 2000, message: 'Enter a valid year' }, 
                    max: { value: new Date().getFullYear() + 6, message: 'Enter a valid year' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your batch year (e.g., 2025)"
                />
                {errors.batchYear && <p className="text-red-500 text-sm">{errors.batchYear.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <select
                  {...register('branch', { required: 'Branch is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                {errors.branch && <p className="text-red-500 text-sm">{errors.branch.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <select
                  {...register('semester', { required: 'Semester is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
                {errors.semester && <p className="text-red-500 text-sm">{errors.semester.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  {...register('section', { required: 'Section is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
                {errors.section && <p className="text-red-500 text-sm">{errors.section.message}</p>}
              </div>
            </>
          )}

          {/* For teachers, only show branch (optional) */}
          {selectedRole === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch (Optional)</label>
              <select
                {...register('branch')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch (Optional)</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a password"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              {...register('confirm_password', {
                validate: (value) =>
                  value === watch('password') || 'Passwords do not match',
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 font-semibold text-white rounded-md focus:outline-none focus:ring-2 ${
              isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Sign Up'}
          </button>
          <ToastContainer />
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;