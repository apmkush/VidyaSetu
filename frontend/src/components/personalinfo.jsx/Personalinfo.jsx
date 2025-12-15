import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../service/url';
import { useSelector } from 'react-redux';

const PersonalInfo = () => {
  const [profileImageFile, setProfileImageFile] = useState(null); // New file selected
  const [profileImageUrl, setProfileImageUrl] = useState(null); // URL from backend
  const [bio, setBio] = useState('');
  const [details, setDetails] = useState({
    fullName: '',
    dateOfBirth: '',
    contact: '',
    email: '',
    gender: '',
    course: '',
    branch: '',
    semester: '',
    section: '',
    batchYear: '',
    address: '',
    userRole: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const authToken = useSelector(state => state.auth.token);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${backendUrl}/user/profile`, {
          headers: {
            Authorization: authToken || localStorage.getItem('authToken')
          }
        });

        if (response.data.success) {
          const user = response.data.user;
          
          // Format dateOfBirth for date input (YYYY-MM-DD)
          let formattedDate = '';
          if (user.dateOfBirth) {
            const date = new Date(user.dateOfBirth);
            formattedDate = date.toISOString().split('T')[0];
          }
          
          setDetails({
            fullName: user.name || '',
            dateOfBirth: formattedDate,
            contact: user.phone || '',
            email: user.email || '',
            gender: user.gender || '',
            course: user.course || '',
            branch: user.branch || '',
            semester: user.semester || '',
            section: user.section || '',
            batchYear: user.batchYear || '',
            address: user.address?.street || '',
            userRole: user.userRole || '',
          });

          // Load bio
          setBio(user.bio || '');

          if (user.profilePic) {
            setProfileImageUrl(user.profilePic + '?t=' + Date.now());
          } else if (user.profileImageURL) {
            setProfileImageUrl(user.profileImageURL + '?t=' + Date.now());
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again.');
        // Fallback to localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          setDetails((prev) => ({
            ...prev,
            fullName: userData.name || '',
            email: userData.email || '',
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    if (authToken || localStorage.getItem('authToken')) {
      fetchUserProfile();
    } else {
      setLoading(false);
      // Fallback to localStorage if no auth token
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setDetails((prev) => ({
          ...prev,
          fullName: userData.name || '',
          email: userData.email || '',
        }));
      }
    }
  }, [authToken]);

  // Debug useEffect to log image URL changes
  useEffect(() => {
    if (profileImageUrl) {
      console.log('Profile image URL updated:', profileImageUrl);
      // Pre-load the image to check if it's accessible
      const img = new Image();
      img.onload = () => console.log('Image loaded successfully');
      img.onerror = () => console.error('Failed to load image from URL:', profileImageUrl);
      img.src = profileImageUrl;
    }
  }, [profileImageUrl]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Only append image if a new file was selected
    if (profileImageFile && profileImageFile instanceof File) {
      formData.append('profileImage', profileImageFile);
    }
    
    formData.append('bio', bio);
    formData.append('fullName', details.fullName);
    formData.append('dateOfBirth', details.dateOfBirth);
    formData.append('contact', details.contact);
    formData.append('email', details.email);
    formData.append('gender', details.gender);
    formData.append('course', details.course);
    formData.append('branch', details.branch);
    formData.append('semester', details.semester);
    formData.append('section', details.section);
    formData.append('batchYear', details.batchYear);
    formData.append('address', details.address);

    try {
      setSaving(true);
      setError(null);
      
      const response = await axios.post(`${backendUrl}/user/profile`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: authToken || localStorage.getItem('authToken')
        },
      });

      if (response.data.success) {
        setIsEditing(false);
        setProfileImageFile(null); // Clear the file after successful upload
        alert('Profile updated successfully!');
        // Refresh profile data
        const refreshResponse = await axios.get(`${backendUrl}/user/profile`, {
          headers: {
            Authorization: authToken || localStorage.getItem('authToken')
          }
        });
        
        if (refreshResponse.data.success) {
          const user = refreshResponse.data.user;
          
          // Format dateOfBirth for date input (YYYY-MM-DD)
          let formattedDate = '';
          if (user.dateOfBirth) {
            const date = new Date(user.dateOfBirth);
            formattedDate = date.toISOString().split('T')[0];
          }
          
          setDetails({
            fullName: user.name || '',
            dateOfBirth: formattedDate,
            contact: user.phone || '',
            email: user.email || '',
            gender: user.gender || '',
            course: user.course || '',
            branch: user.branch || '',
            semester: user.semester || '',
            section: user.section || '',
            batchYear: user.batchYear || '',
            address: user.address?.street || '',
            userRole: user.userRole || '',
          });

          // Update bio from backend
          setBio(user.bio || '');
          
          // Clear file input and update the URL from backend with cache busting
          setProfileImageFile(null);
          if (user.profilePic) {
            // Add cache buster to force fresh image load
            setProfileImageUrl(user.profilePic + '?t=' + Date.now());
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {loading && (
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {!loading && (
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Profile Header Section */}
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b-2 border-gray-200">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-600 relative flex-shrink-0">
            {profileImageFile ? (
              <img
                key={`file-${Date.now()}`}
                src={URL.createObjectURL(profileImageFile)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => console.error('Error loading file image:', e)}
              />
            ) : profileImageUrl ? (
              <img
                key={`url-${profileImageUrl}`}
                src={profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading profile image:', e);
                  console.error('Image URL:', profileImageUrl);
                  // Try loading without cache buster if it fails
                  if (profileImageUrl.includes('?')) {
                    const urlWithoutCache = profileImageUrl.split('?')[0];
                    e.target.src = urlWithoutCache;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span>No Image</span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              Edit
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {details.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              <span className="font-semibold">Role:</span> {details.userRole ? details.userRole.charAt(0).toUpperCase() + details.userRole.slice(1) : 'Not specified'}
            </p>
            {details.branch && (
              <p className="text-lg text-gray-600 mb-4">
                <span className="font-semibold">Branch:</span> {details.branch}
              </p>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              rows="4"
              placeholder="Write a bio about yourself..."
            ></textarea>
          ) : (
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
              {bio || 'No bio added yet.'}
            </p>
          )}
        </div>

        {/* Personal Details Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Full Name */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={details.fullName}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.fullName || 'Not provided'}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={details.dateOfBirth ? details.dateOfBirth.split('T')[0] : ''}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">
                  {details.dateOfBirth ? new Date(details.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={details.gender}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p className="text-gray-800 text-lg">
                  {details.gender ? details.gender.charAt(0).toUpperCase() + details.gender.slice(1) : 'Not provided'}
                </p>
              )}
            </div>

            {/* Contact */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contact"
                  value={details.contact}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.contact || 'Not provided'}</p>
              )}
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={details.email}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.email || 'Not provided'}</p>
              )}
            </div>

            {/* Address */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={details.address}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Street address"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Course</label>
              {isEditing ? (
                <input
                  type="text"
                  name="course"
                  value={details.course}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.course || 'Not provided'}</p>
              )}
            </div>

            {/* Branch */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Branch</label>
              {isEditing ? (
                <input
                  type="text"
                  name="branch"
                  value={details.branch}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.branch || 'Not provided'}</p>
              )}
            </div>

            {/* Semester */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Semester</label>
              {isEditing ? (
                <input
                  type="number"
                  name="semester"
                  value={details.semester}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.semester || 'Not provided'}</p>
              )}
            </div>

            {/* Section */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Section</label>
              {isEditing ? (
                <input
                  type="text"
                  name="section"
                  value={details.section}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.section || 'Not provided'}</p>
              )}
            </div>

            {/* Batch Year */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Batch Year</label>
              {isEditing ? (
                <input
                  type="number"
                  name="batchYear"
                  value={details.batchYear}
                  onChange={handleDetailChange}
                  className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-800 text-lg">{details.batchYear || 'Not provided'}</p>
              )}
            </div>

            {/* User Role (Read-only) */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 block mb-2">User Role</label>
              <p className="text-gray-800 text-lg">
                {details.userRole ? details.userRole.charAt(0).toUpperCase() + details.userRole.slice(1) : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`py-3 px-8 rounded-md transition duration-300 font-semibold text-white ${
                saving 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="py-3 px-8 rounded-md transition duration-300 font-semibold bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default PersonalInfo;
