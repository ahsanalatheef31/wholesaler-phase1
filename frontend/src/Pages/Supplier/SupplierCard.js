import React from 'react';
import '../../Styles/SupplierCard.css';

export default function SupplierCard({ supplier }) {
  return (
    <div className="supplier-card">
      <div className="supplier-header">
        <div className="supplier-info">
          <h3>{supplier.name}</h3>
          <p><strong>Email:</strong> {supplier.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {supplier.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {supplier.address || 'N/A'}</p>
        </div>
      </div>
      <div className="supplier-footer">
        <button className="edit-button">Edit</button>
      </div>
    </div>
  );
}
