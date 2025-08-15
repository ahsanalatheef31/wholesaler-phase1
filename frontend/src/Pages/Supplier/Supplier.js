// pages/Supplier.js
import React, { useState, useEffect } from 'react';
import SupplierCard from './SupplierCard';
import AddSupplierModal from './AddSupplierModal';
import SidebarSearch from '../Supplier/SidebarSearch'
import PopupDialog from '../Auth/PopupDialog';
import '../../Styles/Supplier.css';
import axios from 'axios';

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, supplierId: null });

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

  const handleDeleteSupplier = (supplierId) => {
    setDeleteDialog({ open: true, supplierId });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/suppliers/${deleteDialog.supplierId}/`);
      setDeleteDialog({ open: false, supplierId: null });
      await fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      const msg = error?.response?.data?.detail || error?.response?.data?.error || 'Failed to delete supplier';
      alert(msg);
      setDeleteDialog({ open: false, supplierId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, supplierId: null });
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
              onDelete={handleDeleteSupplier}
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
      <PopupDialog
        open={deleteDialog.open}
        type="warning"
        title="Delete Supplier?"
        message="Are you sure you want to delete this supplier? This will also delete all related products."
        onClose={cancelDelete}
      >
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button className="delete-btn-blue" onClick={confirmDelete}>Yes, Delete</button>
        </div>
      </PopupDialog>
    </div>
  );
}
