import React from 'react';
import '../../Styles/SupplierCard.css';

export default function SupplierCard({ supplier, onDelete }) {

  return (
    <div className="supplier-card">
      <div className="supplier-header">
        <div className="supplier-info">
          <h3>{supplier.name}</h3>
          <p><strong>Email:</strong> {supplier.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {supplier.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {supplier.address || 'N/A'}</p>
        </div>
        <div>
          <button className="delete-btn-blue" onClick={() => onDelete && onDelete(supplier.id)}>Delete</button>
        </div>
      </div>

    </div>
  );
}
