import React, { useState } from 'react';
import axios from 'axios';
import '../../Styles/AddSupplierModal.css';

export default function AddSupplierModal({ onClose, refreshSuppliers }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/suppliers/', formData);
      console.log('Supplier added:', response.data);
      refreshSuppliers();
      onClose();
    } catch (err) {
      console.log('Error caught:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      
      if (err.response) {
        const errorData = err.response.data;
        console.log('Error data type:', typeof errorData);
        console.log('Error data keys:', Object.keys(errorData || {}));

        if (errorData && errorData.error) {
          setError(errorData.error);
        } else if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          const firstKey = Object.keys(errorData)[0];
          setError(errorData[firstKey][0]);
        } else {
          setError('User already found');
        }
      } else if (err.request) {
        setError('Server not responding. Please try again later.');
      } else {
        setError('User already found');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Supplier</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Supplier Name*</label>
          <input 
            type="text" 
            name="name" 
            required 
            onChange={handleChange}
            value={formData.name}
          />

          <label>Email*</label>
          <input 
            type="email" 
            name="email" 
            required 
            onChange={handleChange}
            value={formData.email}
          />

          <label>Phone</label>
          <input 
            type="tel" 
            name="phone" 
            onChange={handleChange}
            value={formData.phone}
          />

          <label>Address</label>
          <textarea 
            rows={2} 
            name="address" 
            onChange={handleChange}
            value={formData.address}
          />

          {error && (
            <div className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
