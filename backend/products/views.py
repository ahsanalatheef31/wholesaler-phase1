import fitz  # PyMuPDF
import re
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        product.delete()
        return Response({'status': 'success'})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['POST'])
def extract_pdf(request):
    try:
        if 'pdf' not in request.FILES:
            return Response({'error': 'No PDF file provided'}, status=400)
        
        pdf_file = request.FILES['pdf']
        
        # Validate file type
        if not pdf_file.name.lower().endswith('.pdf'):
            return Response({'error': 'File must be a PDF'}, status=400)
        
        # Read PDF content
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
        text = ''
        for page in doc:
            text += page.get_text()
        doc.close()
        
        # Debug: Log the extracted text (first 500 characters)
        print(f"Extracted text from PDF (first 500 chars): {text[:500]}")
        
        # Split lines and clean
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Find header index (first line that contains 'product name' and next 4 lines)
        header_keywords = ['product name', 'model', 'price', 'size', 'piece', 'no. of pieces', 'number']
        header_end = 0
        for i, line in enumerate(lines):
            if all(any(h in l.lower() for h in header_keywords) for l in lines[i:i+5]):
                header_end = i + 5
                break
        # If not found, just skip first 5 lines
        if header_end == 0:
            header_end = 5
        
        product_lines = lines[header_end:]
        products = []
        
        # Group every 5 lines as a product
        for i in range(0, len(product_lines), 5):
            group = product_lines[i:i+5]
            if len(group) == 5:
                name, model_no, price, size, pieces = group
                products.append({
                    'name': name,
                    'model_no': model_no,
                    'price': price,
                    'size': size,
                    'pieces': pieces
                })
        
        return Response({
            'products': products,
            'message': f'Successfully extracted {len(products)} products from PDF'
        })
        
    except Exception as e:
        print(f"Error in PDF extraction: {str(e)}")
        return Response({
            'error': 'Failed to extract data from PDF. Please ensure the PDF contains product information in a readable format.',
            'details': str(e)
        }, status=500)

@api_view(['POST'])
def add_product(request):
    try:
        # Handle FormData format from frontend
        products_data = []
        
        # Get all the product data from FormData
        i = 0
        while f'products[{i}][name]' in request.data:
            product_data = {
                'name': request.data[f'products[{i}][name]'],
                'model_no': request.data[f'products[{i}][model_no]'],
                'price': request.data[f'products[{i}][price]'],
                'size': request.data[f'products[{i}][size]'],
                'pieces': request.data[f'products[{i}][pieces]'],
            }
            products_data.append(product_data)
            i += 1
        
        print(f"Received {len(products_data)} products to save")
        print("Products data:", products_data)
        
        serializer = ProductSerializer(data=products_data, many=True)
        if serializer.is_valid():
            serializer.save()
            print("✅ Successfully saved all products")
            return Response({'status': 'success', 'message': f'{len(products_data)} products added successfully'})
        else:
            print("❌ Validation errors:", serializer.errors)
            return Response(serializer.errors, status=400)
    except Exception as e:
        print(f"❌ Error in add_product: {str(e)}")
        return Response({'error': str(e)}, status=500)
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def update_status(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        status = request.data.get('status')
        if status not in dict(Product.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        product.status = status
        product.save()
        return Response({'status': 'success', 'new_status': product.status})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)