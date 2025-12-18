// Detect environment and set backend URL accordingly
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // Production Vercel deployment
    if (window.location.hostname === 'vidya-setu-one.vercel.app') {
      return 'https://vidyasetu-dx4y.onrender.com';
    }
    // Local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  // Default to production backend
  return 'https://vidyasetu-dx4y.onrender.com';
};

export const backendUrl = getBackendUrl();
export const frontendUrl = window?.location?.hostname === 'localhost' 
  ? 'http://localhost:5173'
  : 'https://vidya-setu-one.vercel.app';