import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BarcodePrinter.css';

const BarcodePrinter = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // API base URL
  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter products when supplier changes
    if (selectedSupplier) {
      const filtered = products.filter(product => 
        product.supplier && product.supplier.id === parseInt(selectedSupplier)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedSupplier, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products and suppliers in parallel
      const [productsResponse, suppliersResponse] = await Promise.all([
        axios.get(`${API_BASE}/get-products/`),
        axios.get(`${API_BASE}/suppliers/`)
      ]);

      setProducts(productsResponse.data || []);
      setSuppliers(suppliersResponse.data || []);
      setFilteredProducts(productsResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products and suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (productId) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSelectAllFiltered = () => {
    if (selectedProducts.size === filteredProducts.length) {
      // If all are selected, deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all filtered products
      const allIds = filteredProducts.map(p => p.id);
      setSelectedProducts(new Set(allIds));
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      // If all are selected, deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all products
      const allIds = products.map(p => p.id);
      setSelectedProducts(new Set(allIds));
    }
  };

  const generateBarcodePDF = (params) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}/generate-barcodes/?${queryString}`;
    
    // Open PDF in new tab
    window.open(url, '_blank');
  };

  const handlePrintSelected = () => {
    if (selectedProducts.size === 0) return;
    
    const productIds = Array.from(selectedProducts).join(',');
    generateBarcodePDF({ product_ids: productIds });
  };

  const handlePrintFiltered = () => {
    if (filteredProducts.length === 0) return;
    
    if (selectedSupplier) {
      generateBarcodePDF({ supplier_id: selectedSupplier });
    } else {
      generateBarcodePDF({ all: 'true' });
    }
  };

  const handlePrintAll = () => {
    generateBarcodePDF({ all: 'true' });
  };

  const clearFilters = () => {
    setSelectedSupplier('');
    setSelectedProducts(new Set());
  };

  if (loading) {
    return (
      <div className="barcode-printer">
        <div className="loading">Loading products and suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="barcode-printer">
        <div className="error">{error}</div>
        <button onClick={fetchData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="barcode-printer">
      <h2>Barcode Printer</h2>
      
      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="supplier-filter">Filter by Supplier:</label>
          <select
            id="supplier-filter"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        
        <button onClick={clearFilters} className="clear-btn">
          Clear Filters
        </button>
      </div>

      {/* Selection Summary */}
      <div className="selection-summary">
        <div className="summary-item">
          <span>Total Products: {products.length}</span>
        </div>
        <div className="summary-item">
          <span>Filtered Products: {filteredProducts.length}</span>
        </div>
        <div className="summary-item">
          <span>Selected Products: {selectedProducts.size}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={handlePrintSelected}
          disabled={selectedProducts.size === 0}
          className="print-btn print-selected"
        >
          Print Selected ({selectedProducts.size})
        </button>
        
        <button
          onClick={handlePrintFiltered}
          disabled={filteredProducts.length === 0}
          className="print-btn print-filtered"
        >
          Print Filtered ({filteredProducts.length})
        </button>
        
        <button
          onClick={handlePrintAll}
          disabled={products.length === 0}
          className="print-btn print-all"
        >
          Print All ({products.length})
        </button>
      </div>

      {/* Product List */}
      <div className="product-list">
        <div className="list-header">
          <div className="select-all-controls">
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                onChange={handleSelectAllFiltered}
                className="select-all-checkbox"
              />
              Select All Filtered
            </label>
            
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={selectedProducts.size === products.length && products.length > 0}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
              Select All
            </label>
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-item">
              <label className="product-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleProductSelection(product.id)}
                />
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-details">
                    <span>Model: {product.model_no || 'N/A'}</span>
                    <span>Price: ${product.price}</span>
                    <span>Size: {product.size}</span>
                    <span>Pieces: {product.pieces}</span>
                  </div>
                  {product.supplier && (
                    <div className="supplier-name">
                      Supplier: {product.supplier.name}
                    </div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            No products found matching the current filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodePrinter; 