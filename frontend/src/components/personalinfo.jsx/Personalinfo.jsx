import React, { useState, useEffect } from 'react';
import { BsLinkedin, BsGithub, BsTwitter } from 'react-icons/bs';
import axios from 'axios';
import{backendUrl}from '../../service/url';
import { useSelector } from 'react-redux';

const PersonalInfo = () => {
  const [profileImageFile, setProfileImageFile] = useState(null); // New file selected
  const [profileImageUrl, setProfileImageUrl] = useState(null); // URL from backend
  const [bio, setBio] = useState('');
  const [details, setDetails] = useState({
    fullName: '',
    age: '',
    contact: '',
    email: '',
    address: '',
  });
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
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
          setDetails({
            fullName: user.name || '',
            age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : '',
            contact: user.phone || '',
            email: user.email || '',
            address: user.address?.street || '',
          });

          if (user.profilePic) {
            setProfileImageUrl(user.profilePic);
          } else if (user.profileImageURL) {
            setProfileImageUrl(user.profileImageURL);
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

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prev) => ({ ...prev, [name]: value }));
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
    formData.append('age', details.age);
    formData.append('contact', details.contact);
    formData.append('email', details.email);
    formData.append('address', details.address);
    
    Object.keys(socialLinks).forEach((key) => {
      formData.append(key, socialLinks[key]);
    });

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
          setDetails({
            fullName: user.name || '',
            age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : '',
            contact: user.phone || '',
            email: user.email || '',
            address: user.address?.street || '',
          });
          
          // Update the URL from backend
          if (user.profilePic) {
            setProfileImageUrl(user.profilePic);
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
    <div className="min-h-screen bg-gray-50 p-12">
      {loading && (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      )}

      {error && (
        <div className="max-w-5xl mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {!loading && (
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Profile Image and Info Section */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 relative">
            {profileImageFile ? (
              <img
                src={URL.createObjectURL(profileImageFile)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span>No Image</span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              Edit
            </label>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {details.fullName || 'Your Name'}
            </h1>
            <p className="text-gray-600 mb-4">{bio || 'Write a brief bio about yourself.'}</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
              >
                Edit Profile Info
              </button>
            )}
          </div>
        </div>

        {/* Editable Bio Section */}
        {isEditing ? (
          <div className="mb-8">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-md"
              rows="4"
              placeholder="Write a short bio..."
            ></textarea>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">About Me</h2>
            <p className="text-gray-600">{bio || 'Add a bio about yourself.'}</p>
          </div>
        )}

        {/* Editable Contact Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Full Name */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Full Name</h3>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={details.fullName}
                onChange={handleDetailChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{details.fullName || 'Not provided'}</p>
            )}
          </div>

          {/* Age */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Age</h3>
            {isEditing ? (
              <input
                type="number"
                name="age"
                value={details.age}
                onChange={handleDetailChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{details.age || 'Not provided'}</p>
            )}
          </div>

          {/* Contact */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Contact</h3>
            {isEditing ? (
              <input
                type="text"
                name="contact"
                value={details.contact}
                onChange={handleDetailChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{details.contact || 'Not provided'}</p>
            )}
          </div>

          {/* Email */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Email</h3>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={details.email}
                onChange={handleDetailChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{details.email || 'Not provided'}</p>
            )}
          </div>

          {/* Address */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm col-span-2">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Address</h3>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={details.address}
                onChange={handleDetailChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{details.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Social Links</h3>
          <div className="flex space-x-6">
            <div className="flex-1">
              <BsLinkedin className="text-blue-700 text-2xl" />
              {isEditing ? (
                <input
                  type="url"
                  name="linkedin"
                  value={socialLinks.linkedin}
                  onChange={handleSocialChange}
                  className="w-full p-3 mt-2 border-2 border-gray-300 rounded-md"
                  placeholder="LinkedIn URL"
                />
              ) : (
                <p>{socialLinks.linkedin || 'Not provided'}</p>
              )}
            </div>

            <div className="flex-1">
              <BsGithub className="text-gray-800 text-2xl" />
              {isEditing ? (
                <input
                  type="url"
                  name="github"
                  value={socialLinks.github}
                  onChange={handleSocialChange}
                  className="w-full p-3 mt-2 border-2 border-gray-300 rounded-md"
                  placeholder="GitHub URL"
                />
              ) : (
                <p>{socialLinks.github || 'Not provided'}</p>
              )}
            </div>

            <div className="flex-1">
              <BsTwitter className="text-blue-400 text-2xl" />
              {isEditing ? (
                <input
                  type="url"
                  name="twitter"
                  value={socialLinks.twitter}
                  onChange={handleSocialChange}
                  className="w-full p-3 mt-2 border-2 border-gray-300 rounded-md"
                  placeholder="Twitter URL"
                />
              ) : (
                <p>{socialLinks.twitter || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`py-3 px-6 rounded-md transition duration-300 ${
                saving 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default PersonalInfo;
