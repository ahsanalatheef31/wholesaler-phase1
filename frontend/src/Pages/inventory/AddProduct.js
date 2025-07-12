import React, { useState } from 'react';
import axios from 'axios';
import '../../Styles/AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    model_no: '',
    price: '',
    size: '',
    pieces: '',
    image: null,
  });

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setPdfError('Please select a PDF file');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Please select a valid PDF file');
      return;
    }

    setPdfLoading(true);
    setPdfError('');
    setMessage('');

    try {
      const data = new FormData();
      data.append('pdf', file);
      
      const res = await axios.post('http://localhost:8000/api/extract-pdf/', data);
      
      if (res.data.products && res.data.products.length > 0) {
        setProducts([...products, ...res.data.products]);
        setMessage(`✅ ${res.data.message || `Successfully extracted ${res.data.products.length} products from PDF`}`);
        // Clear the file input
        e.target.value = '';
      } else {
        setPdfError('No products found in the PDF. Please ensure the PDF contains product information in a readable format.');
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      if (error.response && error.response.data) {
        setPdfError(error.response.data.error || 'Failed to extract data from PDF');
      } else {
        setPdfError('Failed to upload PDF. Please try again.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const addManualProduct = () => {
    // Validate required fields
    if (!formData.name || !formData.price || !formData.pieces) {
      setMessage('❌ Please fill in at least Product Name, Price, and Quantity');
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
        if (product.image) {
          payload.append(`products[${index}][image]`, product.image);
        }
      });

      await axios.post('http://localhost:8000/api/add-product/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('✅ Products added successfully!');
      setTimeout(() => {
        window.location.href = '/inventory';
      }, 1500);
    } catch (error) {
      console.error('Error saving products:', error);
      setMessage('❌ Failed to save products. Please try again.');
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="form-heading">Add New Product</h2>

      <div className="form-inputs">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required className="input-field" />
        <input name="model_no" value={formData.model_no} onChange={handleChange} placeholder="Model ID" required className="input-field" />
        <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" required className="input-field" />
        <input name="size" value={formData.size} onChange={handleChange} placeholder="Size" required className="input-field" />
        <input name="pieces" value={formData.pieces} onChange={handleChange} placeholder="Quantity" required className="input-field" />

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

        <button type="button" onClick={addManualProduct} className="add-button">Add Product</button>
        <button
          type="button"
          onClick={() => window.location.href = '/inventory'}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>

      {/* Error and Success Messages */}
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
        <table className="product-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Model ID</th>
              <th>Price</th>
              <th>Size</th>
              <th>Quantity</th>
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
                <td>
                  <button onClick={() => handleDeleteProduct(index)} className="delete-button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {products.length > 0 && (
        <div className="actions">
          <button type="button" onClick={handleSubmit} className="save-button">Save All Products</button>
          <button type="button" onClick={() => window.location.href = '/inventory'} className="cancel-button">Cancel</button>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
