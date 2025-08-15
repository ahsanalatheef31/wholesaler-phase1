from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from ..models import Product, Supplier
from decimal import Decimal
import io

class BarcodeGenerationTestCase(TestCase):
    def setUp(self):
        """Set up test data for barcode generation tests."""
        # Create test supplier
        self.supplier = Supplier.objects.create(
            name="Test Supplier",
            email="test@supplier.com",
            phone="1234567890"
        )
        
        # Create test products
        self.product1 = Product.objects.create(
            name="Test Product 1",
            model_no="TP001",
            price=Decimal('19.99'),
            size="Medium",
            pieces=10,
            supplier=self.supplier
        )
        
        self.product2 = Product.objects.create(
            name="Test Product 2",
            model_no="TP002",
            price=Decimal('29.99'),
            size="Large",
            pieces=5,
            supplier=self.supplier
        )
        
        self.product3 = Product.objects.create(
            name="Test Product 3",
            model_no="TP003",
            price=Decimal('39.99'),
            size="Small",
            pieces=15,
            supplier=self.supplier
        )
        
        # Create client
        self.client = Client()
    
    def test_generate_barcodes_with_product_ids(self):
        """Test barcode generation using specific product IDs."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?product_ids={self.product1.id},{self.product2.id}')
        
        # Assert successful response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertEqual(response['Content-Disposition'], 'attachment; filename="barcodes.pdf"')
        
        # Verify PDF content is not empty and reasonable size
        self.assertGreater(len(response.content), 1000)
        self.assertLess(len(response.content), 1000000)  # Should be less than 1MB
    
    def test_generate_barcodes_with_supplier_id(self):
        """Test barcode generation using supplier ID filter."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?supplier_id={self.supplier.id}')
        
        # Assert successful response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertEqual(response['Content-Disposition'], 'attachment; filename="barcodes.pdf"')
        
        # Verify PDF content is not empty and reasonable size
        self.assertGreater(len(response.content), 1000)
        self.assertLess(len(response.content), 1000000)
    
    def test_generate_barcodes_all_products(self):
        """Test barcode generation for all products."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?all=true')
        
        # Assert successful response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertEqual(response['Content-Disposition'], 'attachment; filename="barcodes.pdf"')
        
        # Verify PDF content is not empty and reasonable size
        self.assertGreater(len(response.content), 1000)
        self.assertLess(len(response.content), 1000000)
    
    def test_generate_barcodes_no_products_found(self):
        """Test barcode generation when no products match criteria."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?product_ids=999,1000')
        
        # Assert bad request response
        self.assertEqual(response.status_code, 400)
    
    def test_generate_barcodes_no_parameters(self):
        """Test barcode generation without any filter parameters."""
        url = reverse('generate_barcodes')
        response = self.client.get(url)
        
        # Assert bad request response
        self.assertEqual(response.status_code, 400)
    
    def test_generate_barcodes_invalid_product_ids(self):
        """Test barcode generation with invalid product ID format."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?product_ids=invalid,format')
        
        # Assert bad request response
        self.assertEqual(response.status_code, 400)
    
    def test_generate_barcodes_invalid_supplier_id(self):
        """Test barcode generation with invalid supplier ID."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?supplier_id=invalid')
        
        # Assert bad request response
        self.assertEqual(response.status_code, 400)
    
    def test_generate_barcodes_category_id_not_implemented(self):
        """Test that category_id filtering returns appropriate error."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?category_id=1')
        
        # Assert bad request response for unimplemented feature
        self.assertEqual(response.status_code, 400)
        self.assertIn("not yet implemented", response.content.decode())
    
    def test_generate_barcodes_mixed_filters(self):
        """Test barcode generation with multiple filter parameters."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?supplier_id={self.supplier.id}&all=true')
        
        # Should work with supplier_id filter
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
    
    def test_generate_barcodes_pdf_structure(self):
        """Test that generated PDF has expected structure and content."""
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?product_ids={self.product1.id}')
        
        self.assertEqual(response.status_code, 200)
        
        # Check PDF header (PDF files start with %PDF)
        pdf_content = response.content.decode('latin-1')  # PDF content may contain binary data
        self.assertTrue(pdf_content.startswith('%PDF') or response.content.startswith(b'%PDF'))
    
    def test_generate_barcodes_multiple_pages(self):
        """Test barcode generation with enough products to create multiple pages."""
        # Create additional products to test pagination
        for i in range(4, 12):  # Create 8 more products (total 11)
            Product.objects.create(
                name=f"Test Product {i}",
                model_no=f"TP00{i}",
                price=Decimal(f'{i}9.99'),
                size="Medium",
                pieces=i * 5,
                supplier=self.supplier
            )
        
        url = reverse('generate_barcodes')
        response = self.client.get(f'{url}?all=true')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        
        # PDF should be larger with more products
        self.assertGreater(len(response.content), 2000) 