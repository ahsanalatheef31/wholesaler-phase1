from django.urls import path,include
from . import views
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')

urlpatterns = [
    path('get-products/', views.get_products),
    path('extract-pdf/', views.extract_pdf),
    path('add-product/', views.add_product),
    path('delete-product/<int:product_id>/', views.delete_product),
    path('', include(router.urls)),
    path('suppliers/<int:supplier_id>/products/',  views.get_supplier_products),

    path('update-status/<int:product_id>/', views.update_status),
]