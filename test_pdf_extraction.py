#!/usr/bin/env python3
"""
Test script to demonstrate improved PDF extraction functionality
This script creates a sample PDF with product data and tests the extraction logic
"""

import fitz  # PyMuPDF
import re
import io

def create_sample_pdf():
    """Create a sample PDF with product data for testing"""
    doc = fitz.open()
    page = doc.new_page()
    
    # Sample product data in different formats
    sample_text = """
    INVOICE - PRODUCT LIST
    
    Product Name: Laptop Dell XPS 13
    Model: XPS13-2023
    Price: $1299.99
    Size: 13.3 inch
    Pieces: 2
    
    Product Name: Wireless Mouse Logitech
    Model: MX-Master-3
    Price: $79.99
    Size: Standard
    Pieces: 5
    
    Product Name: USB-C Cable
    Model: USB-C-3.1
    Price: $15.50
    Size: 1m
    Pieces: 10
    
    --- Alternative Format ---
    
    Item: Samsung Galaxy S23
    Code: S23-128GB
    Price: $899.00
    Size: 6.1 inch
    Qty: 3
    
    Item: Apple AirPods Pro
    Code: APP-2GEN
    Price: $249.99
    Size: One Size
    Qty: 8
    """
    
    page.insert_text((50, 50), sample_text, fontsize=12)
    
    # Save to bytes buffer
    pdf_bytes = doc.write()
    doc.close()
    
    return pdf_bytes

def extract_products_from_text(text):
    """Improved extraction logic (same as in views.py)"""
    # Clean and normalize text
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with single space
    text = text.strip()
    
    extracted_products = []
    
    # Strategy 1: Look for structured data with common patterns
    patterns = [
        # Pattern 1: Product Name: Model: Price: Size: Pieces:
        r'Product\s*Name\s*:\s*([^\n]+).*?Model\s*:\s*([^\n]+).*?Price\s*:\s*([^\n]+).*?Size\s*:\s*([^\n]+).*?Pieces\s*:\s*([^\n]+)',
        # Pattern 2: Name: Model: Price: Size: Quantity:
        r'Name\s*:\s*([^\n]+).*?Model\s*:\s*([^\n]+).*?Price\s*:\s*([^\n]+).*?Size\s*:\s*([^\n]+).*?Quantity\s*:\s*([^\n]+)',
        # Pattern 3: Item: Code: Price: Size: Qty:
        r'Item\s*:\s*([^\n]+).*?Code\s*:\s*([^\n]+).*?Price\s*:\s*([^\n]+).*?Size\s*:\s*([^\n]+).*?Qty\s*:\s*([^\n]+)',
        # Pattern 4: More flexible pattern for various formats
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[:\-]\s*([^\n]+).*?(\d+\.?\d*).*?(\d+)',
    ]
    
    for i, pattern in enumerate(patterns):
        matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
        print(f"Strategy 1, Pattern {i+1} found {len(matches)} matches")
        for match in matches:
            if len(match) >= 4:
                if i == 3:  # Pattern 4 - different structure
                    name = match[0].strip()
                    model_no = match[1].strip()
                    price = match[2].strip()
                    pieces = match[3].strip()
                    size = 'N/A'
                else:
                    name = match[0].strip()
                    model_no = match[1].strip()
                    price = match[2].strip()
                    size = match[3].strip()
                    pieces = match[4].strip()
                
                # Clean up extracted values
                price = re.sub(r'[^\d.]', '', price)  # Keep only numbers and decimal point
                pieces = re.sub(r'[^\d]', '', pieces)  # Keep only numbers
                
                if name and price and pieces:  # Basic validation
                    extracted_products.append({
                        'name': name,
                        'model_no': model_no if model_no else 'N/A',
                        'price': price,
                        'size': size if size else 'N/A',
                        'pieces': pieces
                    })
    
    # Strategy 2: Look for table-like structures
    lines = text.split('\n')
    current_product = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for product information in line
        if re.search(r'product|item|name', line, re.IGNORECASE):
            if current_product and 'name' in current_product:
                extracted_products.append(current_product)
            current_product = {}
            
            # Extract name
            name_match = re.search(r'[:\-]\s*([^\s]+(?:\s+[^\s]+)*)', line)
            if name_match:
                current_product['name'] = name_match.group(1).strip()
        
        # Extract other fields
        if 'model' in line.lower() or 'code' in line.lower():
            model_match = re.search(r'[:\-]\s*([^\s]+(?:\s+[^\s]+)*)', line)
            if model_match:
                current_product['model_no'] = model_match.group(1).strip()
        
        if 'price' in line.lower():
            price_match = re.search(r'[:\-]\s*([\d.]+)', line)
            if price_match:
                current_product['price'] = price_match.group(1).strip()
        
        if 'size' in line.lower():
            size_match = re.search(r'[:\-]\s*([^\s]+(?:\s+[^\s]+)*)', line)
            if size_match:
                current_product['size'] = size_match.group(1).strip()
        
        if 'piece' in line.lower() or 'qty' in line.lower() or 'quantity' in line.lower():
            pieces_match = re.search(r'[:\-]\s*(\d+)', line)
            if pieces_match:
                current_product['pieces'] = pieces_match.group(1).strip()
    
    # Add the last product if exists
    if current_product and 'name' in current_product:
        extracted_products.append(current_product)
    
    print(f"Strategy 2 found {len([p for p in extracted_products if p.get('name')])} products")
    
    # Remove duplicates and validate
    unique_products = []
    seen_names = set()
    
    for product in extracted_products:
        if product.get('name') and product['name'] not in seen_names:
            # Ensure all required fields exist
            if not product.get('price'):
                product['price'] = '0.00'
            if not product.get('pieces'):
                product['pieces'] = '1'
            if not product.get('model_no'):
                product['model_no'] = 'N/A'
            if not product.get('size'):
                product['size'] = 'N/A'
            
            unique_products.append(product)
            seen_names.add(product['name'])
    
    return unique_products

def test_extraction():
    """Test the PDF extraction functionality"""
    print("Creating sample PDF...")
    pdf_bytes = create_sample_pdf()
    
    print("Extracting text from PDF...")
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ''
    for page in doc:
        text += page.get_text()
    doc.close()
    
    print("Extracted text:")
    print("-" * 50)
    print(text[:500] + "..." if len(text) > 500 else text)
    print("-" * 50)
    
    print("\nExtracting products...")
    products = extract_products_from_text(text)
    
    print(f"\nExtracted {len(products)} products:")
    for i, product in enumerate(products, 1):
        print(f"{i}. {product['name']} - Model: {product['model_no']} - Price: ${product['price']} - Size: {product['size']} - Qty: {product['pieces']}")
    
    return products

if __name__ == "__main__":
    test_extraction() 