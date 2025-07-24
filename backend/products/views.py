import fitz  # PyMuPDF
import re
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product,  Supplier
from .serializers import ProductSerializer
from .models import Supplier
from .serializers import SupplierSerializer
from rest_framework import viewsets
from decimal import Decimal



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
        from .models import Invoice
        products_data = []
        i = 0
        while f'products[{i}][name]' in request.data:
            product_data = {
                'name': request.data[f'products[{i}][name]'],
                'model_no': request.data[f'products[{i}][model_no]'],
                'price': request.data[f'products[{i}][price]'],
                'size': request.data[f'products[{i}][size]'],
                'pieces': request.data[f'products[{i}][pieces]'],
                'supplier': request.data.get(f'products[{i}][supplier]', None),
            }
            bill_number = request.data.get(f'products[{i}][bill_number]', None)
            if bill_number:
                try:
                    invoice = Invoice.objects.get(bill_number=bill_number)
                    product_data['invoice'] = invoice
                except Invoice.DoesNotExist:
                    return Response({'error': f"Bill number '{bill_number}' does not exist. Please select a valid bill number."}, status=400)
            else:
                product_data['invoice'] = None
            products_data.append(product_data)
            i += 1
        print(f"Received {len(products_data)} products to save")
        print("Products data:", products_data)
        for pd in products_data:
            # Set supplier as instance
            if pd['supplier']:
                try:
                    pd['supplier'] = Supplier.objects.get(id=pd['supplier'])
                except Supplier.DoesNotExist:
                    pd['supplier'] = None
            else:
                pd['supplier'] = None
            try:
                pd['price'] = Decimal(pd['price'])
            except Exception:
                pd['price'] = 0
            try:
                pd['pieces'] = int(pd['pieces'])
            except Exception:
                pd['pieces'] = 0
            Product.objects.create(**pd)
        print("✅ Successfully saved all products (manual create)")
        return Response({'status': 'success', 'message': f'{len(products_data)} products added successfully'})
    except Exception as e:
        print(f"❌ Error in add_product: {str(e)}")
        return Response({'error': str(e)}, status=500)
    

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer    



from django.http import JsonResponse

def get_supplier_products(request, supplier_id):
    products = Product.objects.filter(supplier_id=supplier_id)
    product_list = [{"id": p.id, "name": p.name} for p in products]
    return JsonResponse(product_list, safe=False)

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

@api_view(['POST'])
def update_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        data = request.data
        # Update fields
        product.name = data.get('name', product.name)
        product.model_no = data.get('model_no', product.model_no)
        product.price = data.get('price', product.price)
        product.size = data.get('size', product.size)
        product.pieces = data.get('pieces', product.pieces)
        # Update supplier if provided
        supplier_id = data.get('supplier')
        if supplier_id:
            try:
                product.supplier = Supplier.objects.get(id=supplier_id)
            except Supplier.DoesNotExist:
                return Response({'error': 'Supplier not found'}, status=404)
        # Update invoice if bill_number provided
        bill_number = data.get('bill_number')
        if bill_number:
            from .models import Invoice
            try:
                product.invoice = Invoice.objects.get(bill_number=bill_number)
            except Invoice.DoesNotExist:
                return Response({'error': 'Invoice not found'}, status=404)
        product.save()
        return Response({'status': 'success', 'message': 'Product updated successfully'})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
# invoices/views.py (bottom of file)
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Invoice, InvoiceItem

@csrf_exempt
def create_invoice(request):
    if request.method == "POST":
        data = json.loads(request.body)

        bill_number = data.get('bill_number')
        items = data.get('items', [])

        if not bill_number or not items:
            return JsonResponse({'error': 'Missing bill number or items'}, status=400)

        invoice = Invoice.objects.create(bill_number=bill_number)

        for item in items:
            InvoiceItem.objects.create(
                invoice=invoice,
                product_name=item['product'],
                model_id=item['model_id'],
                price=item['price'],
                size=item['size'],
                quantity=item['quantity'],
            )
            # Removed: Product.objects.create(...)

        return JsonResponse({'success': True})

from django.http import JsonResponse, Http404
from .models import Invoice

def invoice_details(request, bill_number):
    try:
        invoice = Invoice.objects.get(bill_number=bill_number)
        products = invoice.items.all()  # corrected related_name

        data = {
            "bill_number": invoice.bill_number,
            "created_at": invoice.created_at.strftime("%Y-%m-%d"),
            "products": [
                {
                    "product_name": p.product_name,
                    "model_id": p.model_id,
                    "price": str(p.price),  # Convert Decimal to str for JSON
                    "size": p.size,
                    "quantity": p.quantity
                } for p in products
            ]
        }

        return JsonResponse(data)
    except Invoice.DoesNotExist:
        raise Http404("Invoice not found")
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Invoice

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Invoice

@csrf_exempt
def list_invoices(request):
    if request.method == "GET":
        invoices = Invoice.objects.all().order_by('-created_at')
        data = [
            {
                "bill_number": invoice.bill_number,
                "created_at": invoice.created_at.strftime("%Y-%m-%d"),
            }
            for invoice in invoices
        ]
        return JsonResponse(data, safe=False)