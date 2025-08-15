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
    category: '',
    color: '',
    material: '',
  });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [billNumberList, setBillNumberList] = useState([]);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
    fetchSizes();
    fetchColors();
    fetchMaterials();
    fetchBillNumbers();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/categories/');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/sizes/');
      const data = await res.json();
      setSizes(data);
    } catch (err) {
      setSizes([]);
    }
  };

  const fetchColors = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/colors/');
      const data = await res.json();
      setColors(data);
    } catch (err) {
      setColors([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/materials/');
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      setMaterials([]);
    }
  };

  const fetchBillNumbers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/invoices/');
      const data = await res.json();
      setBillNumberList(data.map(inv => inv.bill_number));
    } catch (err) {
      setBillNumberList([]);
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
      // Assign the currently selected supplier to each extracted product
      const supplierId = formData.supplier;
      const productsWithSupplier = result.products.map(p => ({
        ...p,
        supplier: supplierId
      }));
      setProducts([...products, ...productsWithSupplier]);
      setMessage(result.message);
      e.target.value = '';
    }
  };

  const handleEditProduct = (index) => {
    const productToEdit = products[index];
    setFormData({ ...productToEdit });
    setEditIndex(index);
    setMessage('Editing product. Make changes and click "Add Product" to update.');
    // Remove the product from the list while editing
    setProducts(products.filter((_, i) => i !== index));
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
    // Always attach bill_number to the product
    const productToAdd = { ...formData, bill_number: billNumber };
    if (editIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts.splice(editIndex, 0, productToAdd);
      setProducts(updatedProducts);
      setEditIndex(null);
      setMessage('✅ Product updated');
    } else {
      setProducts([...products, productToAdd]);
      setMessage('✅ Product added to list');
    }
    setFormData({
      name: '',
      model_no: '',
      price: '',
      size: '',
      pieces: '',
      image: null,
      supplier: '',
      category: '',
      color: '',
      material: '',
      bill_number: '',
    });
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
        payload.append(`products[${index}][category]`, product.category || '');
        payload.append(`products[${index}][color]`, product.color || '');
        payload.append(`products[${index}][material]`, product.material || '');
        if (product.image) {
          payload.append(`products[${index}][image]`, product.image);
        }
        payload.append(`products[${index}][bill_number]`, product.bill_number || billNumber);
      });
      await fetch('http://localhost:8000/api/add-product/', {
        method: 'POST',
        body: payload,
      });
      setMessage('✅ Products added successfully!');
      await waitForProduct(products[0].name);
      window.location.href = '/inventory';
    } catch (error) {
      setMessage('❌ Failed to save products. Please try again.');
    }
  };

  const waitForProduct = async (productName) => {
    for (let i = 0; i < 10; i++) { // try up to 10 times
      const res = await fetch('http://localhost:8000/api/get-products/');
      const data = await res.json();
      if (data.some(p => p.name === productName)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    return false;
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
          <select name="size" value={formData.size} onChange={handleChange} className="input-field" required>
            <option value="">Select Size</option>
            {sizes.map(size => (
              <option key={size.id} value={size.name}>{size.name}</option>
            ))}
          </select>
          <input name="pieces" value={formData.pieces} onChange={handleChange} placeholder="Quantity" required className="input-field" />
          <select name="category" value={formData.category} onChange={handleChange} className="input-field">
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <select name="color" value={formData.color} onChange={handleChange} className="input-field">
            <option value="">Select Color</option>
            {colors.map(color => (
              <option key={color.id} value={color.name}>{color.name}</option>
            ))}
          </select>
          <select name="material" value={formData.material} onChange={handleChange} className="input-field">
            <option value="">Select Material</option>
            {materials.map(material => (
              <option key={material.id} value={material.name}>{material.name}</option>
            ))}
          </select>
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
          <div className="bill-number-field" style={{ position: 'relative', marginBottom: 16 }}>
            <input
              name="bill_number"
              value={billNumber}
              onChange={e => {
                setBillNumber(e.target.value);
                setShowBillDropdown(true);
                fetchBillNumbers();
              }}
              onFocus={() => {
                setShowBillDropdown(true);
                fetchBillNumbers();
              }}
              placeholder="Bill Number"
              autoComplete="off"
              className="input-field"
              style={{ width: 200 }}
            />
            {showBillDropdown && billNumberList.length > 0 && (
              <div className="dropdown-list beautified-dropdown-list" style={{ position: 'absolute', zIndex: 30, background: '#fff', border: '1px solid #ccc', width: 200, maxHeight: 150, overflowY: 'auto' }}>
                {billNumberList
                  .filter(bn => bn.toLowerCase().includes(billNumber.toLowerCase()))
                  .map(bn => (
                    <div
                      key={bn}
                      className="dropdown-item beautified-dropdown-item"
                      style={{ padding: 8, cursor: 'pointer' }}
                      onClick={async () => {
                        setBillNumber(bn);
                        setShowBillDropdown(false);
                        // Fetch invoice details
                        const res = await fetch(`http://localhost:8000/api/invoices/${bn}/`);
                        const data = await res.json();
                        // Map invoice products to your product format
                        const invoiceProducts = data.products.map(p => ({
                          name: p.product_name,
                          model_no: p.model_id,
                          price: p.price,
                          size: p.size,
                          pieces: p.quantity,
                          supplier: formData.supplier, // or set as needed
                        }));
                        setProducts(invoiceProducts);
                      }}
                    >
                      {bn}
                    </div>
                  ))}
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
                <th>Category</th>
                <th>Color</th>
                <th>Material</th>
                <th>Supplier</th>
                <th>Bill Number</th>
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
                  <td>{p.category || 'N/A'}</td>
                  <td>{p.color || 'N/A'}</td>
                  <td>{p.material || 'N/A'}</td>
                  <td>{suppliers.find(s => s.id === p.supplier)?.name || 'N/A'}</td>
                  <td>{p.bill_number || billNumber || 'N/A'}</td>
                  <td>
                    <span onClick={() => handleEditProduct(index)} style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginRight: 10 }}>Edit</span>
                    <span onClick={() => handleDeleteProduct(index)} style={{ color: 'red', textDecoration: 'underline', cursor: 'pointer' }}>Delete</span>
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