from django.urls import path
from . import views

urlpatterns = [
    path('get-products/', views.get_products),
    path('extract-pdf/', views.extract_pdf),
    path('add-product/', views.add_product),
    path('delete-product/<int:product_id>/', views.delete_product),
    path('update-status/<int:product_id>/', views.update_status),
]