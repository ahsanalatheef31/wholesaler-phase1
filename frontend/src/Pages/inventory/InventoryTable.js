import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Inventory.css';
import { useNavigate } from 'react-router-dom';
import PopupDialog from '../Auth/PopupDialog';

const columns = ["Product", "Model ID", "Size", "Stock", "Price", "Supplier", "Bill Number", "Actions", "status"];
const statusOptions = ["Pending", "Defective", "Returned"];

export default function InventoryTable({ filters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [billNumbers, setBillNumbers] = useState([]);
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [billDropdownOpen, setBillDropdownOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(filters);
    fetchSuppliers();
    fetchCategories();
    fetchSizes();
    fetchColors();
    fetchMaterials();
    fetchBillNumbers();
  }, [filters]);

  const fetchProducts = async (filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.supplier_id && filterParams.supplier_id !== 'all') params.append('supplier_id', filterParams.supplier_id);
      if (filterParams.category_id && filterParams.category_id !== 'all') params.append('category_id', filterParams.category_id);
      if (filterParams.status && filterParams.status !== 'all') params.append('status', filterParams.status);
      if (filterParams.size_id && filterParams.size_id !== 'all') params.append('size_id', filterParams.size_id);
      if (filterParams.color_id && filterParams.color_id !== 'all') params.append('color_id', filterParams.color_id);
      if (filterParams.material_id && filterParams.material_id !== 'all') params.append('material_id', filterParams.material_id);
      const url = `http://localhost:8000/api/get-products/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/suppliers/');
      setSuppliers(res.data);
    } catch (err) {
      setSuppliers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/categories/');
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/sizes/');
      setSizes(res.data);
    } catch (err) {
      setSizes([]);
    }
  };

  const fetchColors = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/colors/');
      setColors(res.data);
    } catch (err) {
      setColors([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/materials/');
      setMaterials(res.data);
    } catch (err) {
      setMaterials([]);
    }
  };

  const fetchBillNumbers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/invoices/');
      setBillNumbers(res.data.map(inv => inv.bill_number));
    } catch (err) {
      setBillNumbers([]);
    }
  };

  const handleDelete = (productId) => {
    setDeleteDialog({ open: true, productId });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/delete-product/${deleteDialog.productId}/`);
      setDeleteDialog({ open: false, productId: null });
      fetchProducts(filters);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
      setDeleteDialog({ open: false, productId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, productId: null });
  };

  const updateStatus = async (productId, status) => {
    try {
      await axios.post(`http://localhost:8000/api/update-status/${productId}/`, { status });
      setDropdownOpen((prev) => ({ ...prev, [productId]: false }));
      fetchProducts(filters);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDropdown = (productId, open) => {
    setDropdownOpen((prev) => ({ ...prev, [productId]: open }));
  };

  // Handle edit form submit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      // You may need to adjust the endpoint and payload to match your backend
      await axios.post(`http://localhost:8000/api/update-product/${editingProduct.id}/`, editingProduct);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <>
      {editingProduct && (
        <form
          onSubmit={handleUpdateProduct}
          style={{ marginBottom: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8, background: '#f9f9f9' }}
        >
          <h3>Edit Product</h3>
          <input
            value={editingProduct.name}
            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
            placeholder="Product Name"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.model_no}
            onChange={e => setEditingProduct({ ...editingProduct, model_no: e.target.value })}
            placeholder="Model ID"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.size}
            onChange={e => setEditingProduct({ ...editingProduct, size: e.target.value })}
            placeholder="Size"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.pieces}
            onChange={e => setEditingProduct({ ...editingProduct, pieces: e.target.value })}
            placeholder="Stock"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          <input
            value={editingProduct.price}
            onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
            placeholder="Price"
            required
            style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
          />
          {/* Supplier custom dropdown */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              value={suppliers.find(s => s.id === editingProduct.supplier)?.name || ''}
              onFocus={() => setSupplierDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSupplierDropdownOpen(false), 150)}
              onChange={e => {
                setEditingProduct({ ...editingProduct, supplier: '' });
              }}
              placeholder="Select Supplier"
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
              readOnly
            />
            {supplierDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', zIndex: 10, maxHeight: 180, overflowY: 'auto', borderRadius: 4 }}>
                {suppliers.map(s => (
                  <div
                    key={s.id}
                    style={{ padding: 8, cursor: 'pointer', color: '#222' }}
                    onMouseDown={() => {
                      setEditingProduct({ ...editingProduct, supplier: s.id });
                      setSupplierDropdownOpen(false);
                    }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Bill number custom dropdown */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              value={editingProduct.bill_number || ''}
              onFocus={() => setBillDropdownOpen(true)}
              onBlur={() => setTimeout(() => setBillDropdownOpen(false), 150)}
              onChange={e => {
                setEditingProduct({ ...editingProduct, bill_number: e.target.value });
              }}
              placeholder="Select Bill Number"
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
              readOnly
            />
            {billDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', zIndex: 10, maxHeight: 180, overflowY: 'auto', borderRadius: 4 }}>
                {billNumbers.map(bn => (
                  <div
                    key={bn}
                    style={{ padding: 8, cursor: 'pointer', color: '#222' }}
                    onMouseDown={() => {
                      setEditingProduct({ ...editingProduct, bill_number: bn });
                      setBillDropdownOpen(false);
                    }}
                  >
                    {bn}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" style={{ marginRight: 8, background: '#2451a4', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 20px', fontWeight: 500, fontSize: 16 }}>Update</button>
          <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '8px 20px', borderRadius: 5, border: '1px solid #ccc', background: '#fff', fontWeight: 500, fontSize: 16 }}>Cancel</button>
        </form>
      )}
      <table className="inventory-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                No products found. Add some products to get started!
              </td>
            </tr>
          ) : (
            products.map((item) => (
              <tr key={item.id}>
                <td onClick={() => setSelectedProduct(item)} style={{ cursor: 'pointer' }}>
                  <div className="product-info">
                    <div className="product-img-placeholder">40×40</div>
                    <div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-variant">ID: {item.id}</div>
                    </div>
                  </div>
                </td>
                <td>{item.model_no}</td>
                <td>{item.size}</td>
                <td>{item.pieces}</td>
                <td>₹{parseFloat(item.price).toFixed(2)}</td>
                <td>{item.supplier_name ? item.supplier_name : 'N/A'}</td>
                <td>
                  {item.bill_number ? (
                    <span
                      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/invoice/${item.bill_number}`); }}
                    >
                      {item.bill_number}
                    </span>
                  ) : (
                    <span style={{ color: '#aaa' }}>N/A</span>
                  )}
                </td>
                <td>
                  <span
                    onClick={(e) => { e.stopPropagation(); setEditingProduct(item); }}
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginRight: 10 }}
                  >
                    Edit
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Delete
                  </span>
                </td>
                <td style={{ minWidth: 180 }}>
                  <div className="status-actions-row standard">
                    <button
                      title="Mark as Received"
                      className={`status-icon-btn-standard${item.status === 'Received' ? ' active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'Received'); }}
                    >
                      <img
                        src="/checkmark.png"
                        alt="tick"
                        width={20}
                        height={20}
                        style={{
                          filter: item.status === 'Received' ? 'none' : 'grayscale(1) brightness(1.7)',
                          opacity: item.status === 'Received' ? 1 : 0.7
                        }}
                      />
                    </button>
                    <button
                      title="Change Status"
                      className={`status-icon-btn-standard${['Defective', 'Returned'].includes(item.status) ? ' active-x' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleDropdown(item.id, !dropdownOpen[item.id]); }}
                    >
                      <img
                        src="/cross.png"
                        alt="cross"
                        width={20}
                        height={20}
                        style={{
                          filter: ['Defective', 'Returned'].includes(item.status) ? 'none' : 'grayscale(1) brightness(1.7)',
                          opacity: ['Defective', 'Returned'].includes(item.status) ? 1 : 0.7
                        }}
                      />
                    </button>
                    {dropdownOpen[item.id] ? (
                      <select
                        className="status-dropdown-standard status-dropdown-inline"
                        autoFocus
                        value={item.status !== 'Received' ? item.status : ''}
                        onChange={(e) => { e.stopPropagation(); updateStatus(item.id, e.target.value); }}
                        onBlur={(e) => { e.stopPropagation(); handleDropdown(item.id, false); }}
                      >
                        <option value="" disabled>Choose</option>
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="status-text-standard">{item.status}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <PopupDialog
        open={deleteDialog.open}
        type="warning"
        title="Delete Product?"
        message="Are you sure you want to delete this product?"
        onClose={cancelDelete}
      >
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button className="delete-btn-blue" onClick={confirmDelete}>Yes, Delete</button>
        </div>
      </PopupDialog>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="product-details-grid">
                <div className="detail-item">
                  <label>Product Name:</label>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="detail-item">
                  <label>Model ID:</label>
                  <span>{selectedProduct.model_no}</span>
                </div>
                <div className="detail-item">
                  <label>Category:</label>
                  <span>{selectedProduct.category_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Size:</label>
                  <span>{selectedProduct.size_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Color:</label>
                  <span>{selectedProduct.color_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Material:</label>
                  <span>{selectedProduct.material_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Stock:</label>
                  <span>{selectedProduct.pieces}</span>
                </div>
                <div className="detail-item">
                  <label>Price:</label>
                  <span>₹{parseFloat(selectedProduct.price).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <label>Supplier:</label>
                  <span>{selectedProduct.supplier_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Bill Number:</label>
                  <span>{selectedProduct.bill_number || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge status-${selectedProduct.status.toLowerCase()}`}>
                    {selectedProduct.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}