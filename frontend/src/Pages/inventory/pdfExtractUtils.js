// Utility for PDF extraction logic
import axios from 'axios';

/**
 * Uploads a PDF file to the backend and returns extracted products or error.
 * @param {File} file - The PDF file to upload
 * @returns {Promise<{products: Array, message?: string}|{error: string}>}
 */
export async function extractProductsFromPdf(file) {
  if (!file) {
    return { error: 'Please select a PDF file' };
  }
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { error: 'Please select a valid PDF file' };
  }
  try {
    const data = new FormData();
    data.append('pdf', file);
    const res = await axios.post('http://localhost:8000/api/extract-pdf/', data);
    if (res.data.products && res.data.products.length > 0) {
      return {
        products: res.data.products,
        message: res.data.message || `Successfully extracted ${res.data.products.length} products from PDF`,
      };
    } else {
      return { error: 'No products found in the PDF. Please ensure the PDF contains product information in a readable format.' };
    }
  } catch (error) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error || 'Failed to extract data from PDF' };
    } else {
      return { error: 'Failed to upload PDF. Please try again.' };
    }
  }
} 