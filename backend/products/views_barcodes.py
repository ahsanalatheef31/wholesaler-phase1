import io
import tempfile
import os
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view
from .models import Product
import barcode
from barcode.writer import ImageWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from PIL import Image
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def generate_barcodes(request):
    """
    Generate a PDF containing barcodes for products based on various filter criteria.
    
    Query Parameters:
    - product_ids: comma-separated list of product IDs
    - supplier_id: filter by supplier ID
    - category_id: filter by category ID (placeholder for future use)
    - all: set to 'true' to include all products
    
    Returns:
    - HTTP 200: PDF file with barcodes
    - HTTP 400: No products found or invalid parameters
    - HTTP 500: Server error during generation
    """
    try:
        products = []
        
        # Get products based on query parameters
        if 'product_ids' in request.GET:
            # Filter by specific product IDs
            product_ids = request.GET['product_ids'].split(',')
            try:
                product_ids = [int(pid.strip()) for pid in product_ids if pid.strip()]
                products = Product.objects.filter(id__in=product_ids)
            except ValueError:
                return HttpResponseBadRequest("Invalid product IDs provided")
                
        elif 'supplier_id' in request.GET:
            # Filter by supplier ID
            try:
                supplier_id = int(request.GET['supplier_id'])
                products = Product.objects.filter(supplier_id=supplier_id)
            except ValueError:
                return HttpResponseBadRequest("Invalid supplier ID provided")
                
        elif 'category_id' in request.GET:
            # Filter by category ID (placeholder for future implementation)
            try:
                category_id = int(request.GET['category_id'])
                # Note: Category filtering not implemented in current model
                # products = Product.objects.filter(category_id=category_id)
                return HttpResponseBadRequest("Category filtering not yet implemented")
            except ValueError:
                return HttpResponseBadRequest("Invalid category ID provided")
                
        elif request.GET.get('all') == 'true':
            # Get all products
            products = Product.objects.all()
            
        else:
            return HttpResponseBadRequest("No filter parameters provided. Use product_ids, supplier_id, category_id, or all=true")
        
        if not products.exists():
            return HttpResponseBadRequest("No products found matching the specified criteria")
        
        # Generate PDF with barcodes
        pdf_buffer = generate_barcode_pdf(products)
        
        # Create HTTP response
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="barcodes.pdf"'
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating barcodes: {str(e)}")
        return HttpResponse("Internal server error during barcode generation", status=500)

def generate_barcode_pdf(products):
    """
    Generate a PDF containing barcodes for the given products.
    
    Args:
        products: QuerySet of Product objects
        
    Returns:
        BytesIO buffer containing the PDF
    """
    # Create in-memory buffer for PDF
    pdf_buffer = io.BytesIO()
    
    # Create PDF canvas
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    page_width, page_height = A4
    
    # PDF layout settings
    margin_left = 0.3 * inch
    margin_top = 0.3 * inch
    barcode_width = 2.5 * inch
    barcode_height = 1.5 * inch
    text_height = 0.4 * inch
    spacing = 0.3 * inch
    
    # Calculate grid layout (2 columns for bigger barcodes)
    cols = 2
    col_width = (page_width - 2 * margin_left) / cols
    
    current_row = 0
    current_col = 0
    y_position = page_height - margin_top
    
    for product in products:
        # Check if we need a new page
        if y_position < margin_top + barcode_height + text_height + spacing:
            c.showPage()
            y_position = page_height - margin_top
            current_row = 0
            current_col = 0
        
        # Calculate position for current barcode
        x_position = margin_left + (current_col * col_width)
        
        # Generate barcode value based on priority logic
        barcode_value = get_barcode_value(product)
        
        # Generate barcode image
        barcode_image_path = generate_barcode_image(barcode_value)
        
        try:
            # Add barcode image to PDF
            c.drawImage(barcode_image_path, x_position, y_position - barcode_height, 
                       width=barcode_width, height=barcode_height)
            
            # Clean up temporary file
            if os.path.exists(barcode_image_path):
                os.unlink(barcode_image_path)
                
        except Exception as e:
            logger.error(f"Error adding barcode image to PDF: {str(e)}")
            # Continue without the barcode image
        
        # Add product name below barcode
        c.setFont("Helvetica", 10)
        c.drawString(x_position, y_position - barcode_height - 0.2 * inch, 
                    str(product.name)[:30])  # Truncate long names
        
        # Add product code text below name
        c.setFont("Helvetica", 8)
        c.drawString(x_position, y_position - barcode_height - 0.4 * inch, 
                    f"Code: {barcode_value}")
        
        # Update position for next barcode
        current_col += 1
        if current_col >= cols:
            current_col = 0
            current_row += 1
            y_position -= (barcode_height + text_height + spacing)
    
    # Save the PDF
    c.save()
    pdf_buffer.seek(0)
    
    return pdf_buffer

def get_barcode_value(product):
    """
    Determine the barcode value for a product based on priority logic.
    
    Priority order:
    1. product.barcode_value (if exists and set)
    2. product.model_no
    3. product.id
    
    Args:
        product: Product object
        
    Returns:
        String value to encode in barcode
    """
    # Check if barcode_value attribute exists and is set
    if hasattr(product, 'barcode_value') and product.barcode_value:
        return str(product.barcode_value)
    
    # Use model_no if available
    if product.model_no:
        return str(product.model_no)
    
    # Fallback to product ID
    return str(product.id)

def generate_barcode_image(barcode_value):
    """
    Generate a barcode image using python-barcode library.
    
    Args:
        barcode_value: String value to encode
        
    Returns:
        String path to temporary barcode image file
    """
    try:
        # Create barcode using Code128 format
        barcode_instance = barcode.get('code128', barcode_value, writer=ImageWriter())
        
        # Create temporary file for the barcode image
        temp_fd, temp_path = tempfile.mkstemp(suffix='.png')
        os.close(temp_fd)  # Close the file descriptor
        
        # Generate image to temporary file
        barcode_instance.write(temp_path)
        
        return temp_path
        
    except Exception as e:
        logger.error(f"Error generating barcode for value '{barcode_value}': {str(e)}")
        # Return a placeholder path or raise the exception
        raise 