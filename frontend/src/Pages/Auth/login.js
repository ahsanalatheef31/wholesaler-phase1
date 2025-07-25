import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/Login.css';
import axios from 'axios';
import PopupDialog from './PopupDialog';
import { useAuth } from '../../Context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [popup, setPopup] = useState({ open: false, type: 'success', title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/accounts/login/', formData);
      setPopup({ open: true, type: 'success', title: 'Login Successful', message: 'You have logged in successfully.' });
      setTimeout(() => {
        login(res.data.access); // update context after popup
        setPopup({ ...popup, open: false });
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setPopup({ open: true, type: 'error', title: 'Login Failed', message: 'Invalid username or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-background">
      <PopupDialog {...popup} onClose={() => setPopup({ ...popup, open: false })} />
      <div className="main-box">
        <div className="form-box">
          <h2>Welcome Back</h2>
          <button className="google-btn">
            <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Log in with Google</span>
          </button>
          <div className="divider"><span>OR LOGIN WITH EMAIL</span></div>
          <form onSubmit={handleSubmit}>
            <input name="username" placeholder="Your Username" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Your Password" onChange={handleChange} required />
            <div className="options">
              <label><input type="checkbox" /> Keep me logged in</label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
          </form>
          <p className="signup-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
        <div className="image-box">
          <img src="/ima.png" alt="My Photo" width="400" />
        </div>
      </div>
    </div>
  );
}

export default Login;
