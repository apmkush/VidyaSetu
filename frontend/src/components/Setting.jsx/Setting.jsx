import React, { useState } from 'react';
import{backendUrl}from '../../service/url';

const Setting = () => {
    const [settings, setSettings] = useState({
        theme: 'light',
        otp: '',
        newPassword: ''
    });

    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [showOTPCard, setShowOTPCard] = useState(false);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: value
        }));
    };

    const handleNewPasswordChange = (e) => {
        setSettings({
            ...settings,
            newPassword: e.target.value
        });
    };

    const handleSaveSettings = () => {
        // Save settings to backend
        alert('Settings saved successfully!');
    };

    const handleResetPassword = () => {
        setShowOTPCard(true);
    };

    const handleOTPVerification = () => {
        if (settings.otp === '123456') {
            setIsOTPVerified(true);
            alert('OTP Verified! You can now set a new password.');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    const handleSetPassword = () => {
        alert('Password successfully reset!');
        setShowOTPCard(false);
        setIsOTPVerified(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6">Account Settings</h2>

            {/* Grid layout for large and small screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
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
                <div className="flex justify-end lg:col-span-2">
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
