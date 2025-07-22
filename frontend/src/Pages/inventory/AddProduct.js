import React, { useState, useEffect } from 'react';
import '../../Styles/AddProduct.css';
import { extractProductsFromPdf } from './pdfExtractUtils';
import AddSupplierModal from '../Supplier/AddSupplierModal';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    model_no: '',
    price: '',
    size: '',
    pieces: '',
    image: null,
    supplier: '',
  });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/suppliers/');
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      setSuppliers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSupplierSearch = (e) => {
    setSupplierSearch(e.target.value);
    setFormData({ ...formData, supplier: '' });
  };

  const handleSupplierSelect = (supplierId) => {
    setFormData({ ...formData, supplier: supplierId });
    setSupplierSearch('');
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    setPdfLoading(true);
    setPdfError('');
    setMessage('');
    const result = await extractProductsFromPdf(file);
    setPdfLoading(false);
    if (result.error) {
      setPdfError(result.error);
    } else {
      setProducts([...products, ...result.products]);
      setMessage(result.message);
      e.target.value = '';
    }
  };

  const addManualProduct = () => {
    if (!formData.name || !formData.price || !formData.pieces) {
      setMessage('❌ Please fill in at least Product Name, Price, and Quantity');
      return;
    }
    if (!formData.supplier) {
      setMessage('❌ Please select a supplier');
      return;
    }
    setProducts([...products, formData]);
    setFormData({
      name: '',
      model_no: '',
      price: '',
      size: '',
      pieces: '',
      image: null,
      supplier: '',
    });
    setMessage('✅ Product added to list');
  };

  const handleDeleteProduct = (indexToRemove) => {
    setProducts(products.filter((_, index) => index !== indexToRemove));
    setMessage('✅ Product removed from list');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (products.length === 0) {
      setMessage('❌ Please add at least one product before saving');
      return;
    }
    try {
      const payload = new FormData();
      products.forEach((product, index) => {
        payload.append(`products[${index}][name]`, product.name);
        payload.append(`products[${index}][model_no]`, product.model_no);
        payload.append(`products[${index}][price]`, product.price);
        payload.append(`products[${index}][size]`, product.size);
        payload.append(`products[${index}][pieces]`, product.pieces);
        payload.append(`products[${index}][supplier]`, product.supplier);
        if (product.image) {
          payload.append(`products[${index}][image]`, product.image);
        }
      });
      await fetch('http://localhost:8000/api/add-product/', {
        method: 'POST',
        body: payload,
      });
      setMessage('✅ Products added successfully!');
      setTimeout(() => {
        window.location.href = '/inventory';
      }, 1500);
    } catch (error) {
      setMessage('❌ Failed to save products. Please try again.');
    }
  };

  // Filter suppliers for dropdown
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div className="add-product-container beautified-product-form">
      <h2 className="form-heading">Add New Product</h2>
      <form className="form-inputs beautified-form-inputs" onSubmit={handleSubmit}>
        <div className="beautified-fields-row">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="input-field" />
          <input name="model_no" value={formData.model_no} onChange={handleChange} placeholder="Model ID" required className="input-field" />
          <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" required className="input-field" />
          <input name="size" value={formData.size} onChange={handleChange} placeholder="Size" required className="input-field" />
          <input name="pieces" value={formData.pieces} onChange={handleChange} placeholder="Quantity" required className="input-field" />
          <div className="beautified-supplier-dropdown">
            <input
              type="text"
              placeholder="Search or select supplier..."
              value={supplierSearch || (suppliers.find(s => s.id === formData.supplier)?.name || '')}
              onChange={handleSupplierSearch}
              className="input-field"
              autoComplete="off"
              style={{ zIndex: 20 }}
            />
            {supplierSearch && (
              <div className="dropdown-list beautified-dropdown-list">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map(s => (
                    <div key={s.id} className="dropdown-item beautified-dropdown-item" onClick={() => handleSupplierSelect(s.id)}>
                      {s.name}
                    </div>
                  ))
                ) : (
                  <div className="beautified-no-supplier">
                    No supplier found. <button type="button" className="add-button" onClick={() => setShowSupplierModal(true)}>+ Add Supplier</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <label className="file-label">
            {pdfLoading ? 'Processing PDF...' : 'Select Bill (PDF)'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
              disabled={pdfLoading}
            />
          </label>
        </div>
        <div className="beautified-actions-row">
          <button type="button" onClick={addManualProduct} className="add-button">Add Product</button>
          <button type="button" onClick={() => window.location.href = '/inventory'} className="cancel-button">Cancel</button>
        </div>
      </form>
      {pdfError && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          ❌ {pdfError}
        </div>
      )}
      {message && (
        <div className="message" style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
          {message}
        </div>
      )}
      {products.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Model ID</th>
                <th>Price</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={index}>
                  <td>{p.name}</td>
                  <td>{p.model_no}</td>
                  <td>{p.price}</td>
                  <td>{p.size}</td>
                  <td>{p.pieces}</td>
                  <td>{suppliers.find(s => s.id === p.supplier)?.name || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleDeleteProduct(index)} className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="actions">
            <button type="button" onClick={handleSubmit} className="save-button">Save All Products</button>
            <button type="button" onClick={() => window.location.href = '/inventory'} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
      {showSupplierModal && (
        <AddSupplierModal
          onClose={() => setShowSupplierModal(false)}
          refreshSuppliers={() => { fetchSuppliers(); setShowSupplierModal(false); }}
        />
      )}
    </div>
  );
};

export default AddProduct;