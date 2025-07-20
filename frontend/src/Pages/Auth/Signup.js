import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/Login.css'; // Reuse the same CSS
import axios from 'axios';
import PopupDialog from './PopupDialog';

function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [popup, setPopup] = useState({ open: false, type: 'success', title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/accounts/register/', formData);
      setPopup({ open: true, type: 'success', title: 'Signup Successful', message: 'Your account has been created successfully.' });
      setTimeout(() => {
        setPopup({ ...popup, open: false });
        navigate('/login');
      }, 1200);
    } catch (err) {
      setPopup({ open: true, type: 'error', title: 'Signup Failed', message: 'Signup failed: ' + (err.response?.data?.username || err.response?.data?.email || 'Please check your details and try again.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-background">
      <PopupDialog {...popup} onClose={() => setPopup({ ...popup, open: false })} />
      <div className="main-box">
        <div className="form-box">
          <h2>Create Your Account</h2>
          <button className="google-btn">
            <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign up with Google</span>
          </button>
          <div className="divider"><span>OR SIGN UP WITH EMAIL</span></div>
          <form onSubmit={handleSubmit}>
            <input name="username" placeholder="Username" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
          </form>
          <p className="signup-link">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
        <div className="image-box">
          <img src="/ima.png" alt="My Photo" width="400" />
        </div>
      </div>
    </div>
  );
}

export default Signup;
