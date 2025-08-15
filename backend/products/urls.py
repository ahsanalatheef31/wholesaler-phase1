from django.urls import path,include
from . import views
from . import views_barcodes
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')

urlpatterns = [
    path('get-products/', views.get_products),
    path('extract-pdf/', views.extract_pdf),
    path('add-product/', views.add_product),


    path('delete-product/<int:product_id>/', views.delete_product),

    path('suppliers/<int:supplier_id>/products/',  views.get_supplier_products),
    path('update-status/<int:product_id>/', views.update_status),
    path('update-product/<int:product_id>/', views.update_product),
    # invoices/urls.py (bottom of existing urlpatterns)
    path('invoices/create/', views.create_invoice, name='invoice-create'),
    path('invoices/<str:bill_number>/', views.invoice_details, name='invoice-detail'),
    path('invoices/', views.list_invoices, name='invoice-list'),
    # New barcode generation endpoint
    path('generate-barcodes/', views_barcodes.generate_barcodes, name='generate_barcodes'),
    path('categories/', views.get_categories, name='get_categories'),
    path('sizes/', views.get_sizes, name='get_sizes'),
    path('colors/', views.get_colors, name='get_colors'),
    path('materials/', views.get_materials, name='get_materials'),
    path('', include(router.urls)),
]
