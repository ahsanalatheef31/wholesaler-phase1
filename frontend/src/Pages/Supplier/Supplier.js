// pages/Supplier.js
import React, { useState, useEffect } from 'react';
import SupplierCard from './SupplierCard';
import AddSupplierModal from './AddSupplierModal';
import SidebarSearch from '../Supplier/SidebarSearch'
import '../../Styles/Supplier.css';
import axios from 'axios';

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/suppliers/');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };



  return (
    <div className="supplier-container">
      <main className="main-content">
        <div className="supplier-header-row">
          <h2>Supplier Directory</h2>
          <p><b>Total Suppliers:</b> {suppliers.length}</p>
        </div>

        <div className="card-grid">
          {suppliers.map(supplier => (
            <SupplierCard 
              key={supplier.id} 
              supplier={supplier} 
            />
          ))}
        </div>
      </main>

      <aside className="sidebar">
        <h2>Search & Filters</h2>
        <button className="add-button" onClick={() => setShowModal(true)}>+ Add New Supplier</button>
        {showModal && <AddSupplierModal onClose={() => setShowModal(false)} refreshSuppliers={fetchSuppliers} />}
        <SidebarSearch suppliers={suppliers} />
        <div className="quick-links">
          <h4>Quick Links</h4>
          <a href="#">Top Suppliers</a>
          <a href="#">Recently Added</a>
          <a href="#">Expiring Contracts</a>
        </div>
      </aside>
    </div>
  );
}
