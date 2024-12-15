import React, { useState } from 'react';

const Setting = () => {
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            sms: false,
            push: true,
            mentions: true,
            jobUpdates: false
        },
        privacy: {
            profileVisibility: 'public',
            activityStatus: true,
            locationSharing: false,
            whoCanMessage: 'everyone',
        },
        theme: 'light',
        language: 'en',
        profilePicture: '/path/to/saved/profile/picture.jpg', // Default saved profile picture
        otp: '',
        newPassword: ''
    });

    const [isOTPVerified, setIsOTPVerified] = useState(false); // To track OTP verification state
    const [showOTPCard, setShowOTPCard] = useState(false); // To toggle OTP card visibility

    const handleToggle = (category, setting) => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            [category]: {
                ...prevSettings[category],
                [setting]: !prevSettings[category][setting]
            }
        }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: value
        }));
    };

    const handlePrivacyChange = (e) => {
        const { name, value } = e.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            privacy: {
                ...prevSettings.privacy,
                [name]: value
            }
        }));
    };

    const handlePasswordChange = (e) => {
        setSettings({
            ...settings,
            password: e.target.value
        });
    };

    const handleNewPasswordChange = (e) => {
        setSettings({
            ...settings,
            newPassword: e.target.value
        });
    };

    const handleProfilePictureChange = (e) => {
        setSettings({
            ...settings,
            profilePicture: URL.createObjectURL(e.target.files[0])
        });
    };

    const handleSaveSettings = () => {
        // Save settings to backend
        alert('Settings saved successfully!');
    };

    const handleResetPassword = () => {
        setShowOTPCard(true); // Show OTP card when password reset is triggered
    };

    const handleOTPVerification = () => {
        if (settings.otp === '123456') { // Simulated OTP for testing
            setIsOTPVerified(true);
            alert('OTP Verified! You can now set a new password.');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    const handleSetPassword = () => {
        // Save the new password to the backend
        alert('Password successfully reset!');
        setShowOTPCard(false);
        setIsOTPVerified(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6">Account Settings</h2>

            {/* Grid layout for large and small screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Picture */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">Profile Picture</h3>
                    <div className="flex items-center space-x-4">
                        <img
                            src={settings.profilePicture || '/default-profile.jpg'} // Display saved profile picture
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                                className="py-2 px-4 border rounded-md"
                            />
                            <p className="text-sm text-gray-500 mt-2">Choose a profile picture</p>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                        {['email', 'sms', 'push', 'mentions', 'jobUpdates'].map((type) => (
                            <div key={type} className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 capitalize">{type} notifications</label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[type]}
                                    onChange={() => handleToggle('notifications', type)}
                                    className="form-checkbox h-5 w-5 text-indigo-600"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
                            <select
                                name="profileVisibility"
                                value={settings.privacy.profileVisibility}
                                onChange={handlePrivacyChange}
                                className="border rounded-md py-1 px-2"
                            >
                                <option value="public">Public</option>
                                <option value="friends">Friends Only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Show Activity Status</label>
                            <input
                                type="checkbox"
                                checked={settings.privacy.activityStatus}
                                onChange={() => handleToggle('privacy', 'activityStatus')}
                                className="form-checkbox h-5 w-5 text-indigo-600"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Location Sharing</label>
                            <input
                                type="checkbox"
                                checked={settings.privacy.locationSharing}
                                onChange={() => handleToggle('privacy', 'locationSharing')}
                                className="form-checkbox h-5 w-5 text-indigo-600"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Who Can Message You</label>
                            <select
                                name="whoCanMessage"
                                value={settings.privacy.whoCanMessage}
                                onChange={handlePrivacyChange}
                                className="border rounded-md py-1 px-2"
                            >
                                <option value="everyone">Everyone</option>
                                <option value="connections">Connections Only</option>
                                <option value="none">No One</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">Theme</h3>
                    <select
                        name="theme"
                        value={settings.theme}
                        onChange={handleSelectChange}
                        className="border rounded-md py-1 px-2 w-full"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                </div>

                {/* Language Settings */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">Language</h3>
                    <select
                        name="language"
                        value={settings.language}
                        onChange={handleSelectChange}
                        className="border rounded-md py-1 px-2 w-full"
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                    </select>
                </div>

                {/* Password Settings */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
                    <button
                        onClick={handleResetPassword}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Reset Password
                    </button>
                </div>

                {/* OTP Verification Card */}
                {showOTPCard && !isOTPVerified && (
                    <div className="bg-white shadow-lg rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-2xl font-semibold mb-4">Verify OTP</h3>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={settings.otp}
                            onChange={(e) => setSettings({ ...settings, otp: e.target.value })}
                            className="w-full border rounded-md py-2 px-4 mb-4"
                        />
                        <button
                            onClick={handleOTPVerification}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                        >
                            Verify OTP
                        </button>
                    </div>
                )}

                {/* Set New Password */}
                {isOTPVerified && (
                    <div className="bg-white shadow-lg rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-2xl font-semibold mb-4">Set New Password</h3>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={settings.newPassword}
                            onChange={handleNewPasswordChange}
                            className="w-full border rounded-md py-2 px-4 mb-4"
                        />
                        <button
                            onClick={handleSetPassword}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                        >
                            Set Password
                        </button>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Setting;
