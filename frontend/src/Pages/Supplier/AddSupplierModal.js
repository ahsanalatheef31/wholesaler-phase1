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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/suppliers/', formData);
      console.log('Supplier saved:', response.data);
      refreshSuppliers();  // <- Fetch updated list
      onClose();           // <- Close modal
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error connecting to server');
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
          <input type="text" name="name" required onChange={handleChange} />

          <label>Email*</label>
          <input type="email" name="email" required onChange={handleChange} />

          <label>Phone</label>
          <input type="tel" name="phone" onChange={handleChange} />

          <label>Address</label>
          <textarea rows={2} name="address" onChange={handleChange} />

    

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-btn">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>
  );
}
